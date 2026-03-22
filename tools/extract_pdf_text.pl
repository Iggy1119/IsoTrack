#!/usr/bin/perl

use strict;
use warnings;
use utf8;
use Compress::Zlib;

binmode STDOUT, ":utf8";

my $file = shift @ARGV or die "usage: $0 <pdf>\n";
open my $fh, "<:raw", $file or die "open $file: $!\n";
local $/;
my $pdf = <$fh>;
close $fh;

my %obj;
while ($pdf =~ /(\d+)\s+(\d+)\s+obj\s*(.*?)\s*endobj/sg) {
    $obj{$1} = $3;
}

sub split_obj {
    my ($body) = @_;
    if ($body =~ /^(<<.*?>>)\s*stream\r?\n(.*)\r?\nendstream\s*$/s) {
        return ($1, $2);
    }

    return ($body, undef);
}

sub decode_stream {
    my ($dict, $stream) = @_;
    return undef unless defined $stream;

    if ($dict =~ /\/FlateDecode/) {
        my $out = uncompress($stream);
        return $out if defined $out;
    }

    return $stream;
}

sub parse_cmap {
    my ($text) = @_;
    my %map;

    while ($text =~ /(\d+)\s+beginbfchar\s*(.*?)\s*endbfchar/sg) {
        my $block = $2;
        while ($block =~ /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g) {
            my ($src, $dst) = ($1, $2);
            $map{ uc $src } = pack("H*", $dst);
        }
    }

    while ($text =~ /(\d+)\s+beginbfrange\s*(.*?)\s*endbfrange/sg) {
        my $block = $2;

        while ($block =~ /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g) {
            my ($start, $end, $dst) = ($1, $2, $3);
            my $s = hex($start);
            my $e = hex($end);
            my $d = hex($dst);

            for my $i (0 .. ($e - $s)) {
                $map{ sprintf("%04X", $s + $i) } = pack("n", $d + $i);
            }
        }

        while ($block =~ /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[(.*?)\]/sg) {
            my ($start, undef, $arr) = ($1, $2, $3);
            my $s = hex($start);
            my $i = 0;

            while ($arr =~ /<([0-9A-Fa-f]+)>/g) {
                $map{ sprintf("%04X", $s + $i) } = pack("H*", $1);
                $i++;
            }
        }
    }

    return \%map;
}

my %font_map;
for my $id (keys %obj) {
    my $body = $obj{$id};
    next unless $body =~ /\/ToUnicode\s+(\d+)\s+\d+\s+R/;

    my $tu = $1;
    my ($dict, $stream) = split_obj($obj{$tu});
    my $cmap = decode_stream($dict, $stream);
    next unless defined $cmap;

    $font_map{$id} = parse_cmap($cmap);
}

sub decode_hexstr {
    my ($hex, $map) = @_;
    my $out = "";

    for (my $i = 0; $i < length($hex); $i += 4) {
        my $code = uc substr($hex, $i, 4);
        my $u = $map->{$code};
        $out .= defined($u) ? $u : "?";
    }

    return $out;
}

sub literal_to_hex {
    my ($s) = @_;
    my @bytes;
    my @chars = split //, $s;

    for (my $i = 0; $i < @chars; $i++) {
        my $ch = $chars[$i];

        if ($ch eq "\\") {
            $i++;
            last if $i > $#chars;
            my $next = $chars[$i];

            if ($next =~ /[0-7]/) {
                my $oct = $next;
                for (1 .. 2) {
                    last if $i + 1 > $#chars || $chars[$i + 1] !~ /[0-7]/;
                    $i++;
                    $oct .= $chars[$i];
                }
                push @bytes, oct($oct);
            }
            elsif ($next eq "n") {
                push @bytes, 10;
            }
            elsif ($next eq "r") {
                push @bytes, 13;
            }
            elsif ($next eq "t") {
                push @bytes, 9;
            }
            elsif ($next eq "b") {
                push @bytes, 8;
            }
            elsif ($next eq "f") {
                push @bytes, 12;
            }
            else {
                push @bytes, ord($next);
            }
        }
        else {
            push @bytes, ord($ch);
        }
    }

    return join("", map { sprintf "%02X", $_ } @bytes);
}

sub decode_array_piece {
    my ($arr, $font_id) = @_;
    return "" unless $font_id && $font_map{$font_id};

    my $piece = "";
    while ($arr =~ /\((.*?)(?<!\\)\)|<([0-9A-Fa-f]+)>/g) {
        my ($lit, $hex) = ($1, $2);
        if (defined $lit) {
            $piece .= decode_hexstr(literal_to_hex($lit), $font_map{$font_id});
        }
        elsif (defined $hex) {
            $piece .= decode_hexstr($hex, $font_map{$font_id});
        }
    }

    return $piece;
}

sub decode_block {
    my ($text, $fonts) = @_;
    my $current_font;
    my @lines;
    my $line = "";

    pos($text) = 0;

    while ($text =~ m{
        /(F\d+)\s+[\d\.]+\s+Tf
        |
        \[(.*?)\]\s*TJ
        |
        \((.*?)(?<!\\)\)\s*Tj
        |
        <([0-9A-Fa-f]+)>\s*Tj
        |
        T\*
    }sgx) {
        if (defined $1) {
            $current_font = $fonts->{$1};
            next;
        }

        if (defined $2) {
            $line .= decode_array_piece($2, $current_font);
            next;
        }

        if (defined $3) {
            $line .= decode_hexstr(literal_to_hex($3), $font_map{$current_font})
                if $current_font && $font_map{$current_font};
            next;
        }

        if (defined $4) {
            $line .= decode_hexstr($4, $font_map{$current_font})
                if $current_font && $font_map{$current_font};
            next;
        }

        if ($line =~ /\S/) {
            push @lines, $line;
        }
        $line = "";
    }

    push @lines, $line if $line =~ /\S/;
    return @lines;
}

my ($pages_obj) = $pdf =~ /\/Kids \[(.*?)\]/s;
my @pages = $pages_obj =~ /(\d+)\s+\d+\s+R/g;

my $page_num = 0;
for my $pid (@pages) {
    $page_num++;

    my $body = $obj{$pid};
    my ($font_res) = $body =~ /\/Font\s+(\d+)\s+\d+\s+R/;
    my ($content) = $body =~ /\/Contents\s+(\d+)\s+\d+\s+R/;
    next unless $content;

    my %fonts;
    if ($font_res) {
        my $font_body = $obj{$font_res};
        while ($font_body =~ /\/(F\d+)\s+(\d+)\s+\d+\s+R/g) {
            $fonts{$1} = $2;
        }
    }

    my ($content_dict, $content_stream) = split_obj($obj{$content});
    my $content_text = decode_stream($content_dict, $content_stream);
    next unless defined $content_text;

    print "\n=== PAGE $page_num ===\n";
    while ($content_text =~ /BT(.*?)ET/sg) {
        my @lines = decode_block($1, \%fonts);
        for my $line (@lines) {
            $line =~ s/\x00//g;
            $line =~ s/[\r\n]+/ /g;
            $line =~ s/\s+/ /g;
            $line =~ s/^\s+|\s+$//g;
            print "$line\n" if $line =~ /\S/;
        }
    }
}
