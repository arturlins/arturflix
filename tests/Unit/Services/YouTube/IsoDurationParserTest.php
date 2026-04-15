<?php

use App\Services\YouTube\IsoDurationParser;

it('parses minutes and seconds', function (): void {
    expect(IsoDurationParser::toSeconds('PT4M13S'))->toBe(253);
});

it('parses hours minutes seconds', function (): void {
    expect(IsoDurationParser::toSeconds('PT1H2M3S'))->toBe(3723);
});

it('parses only seconds', function (): void {
    expect(IsoDurationParser::toSeconds('PT45S'))->toBe(45);
});

it('parses only minutes', function (): void {
    expect(IsoDurationParser::toSeconds('PT15M'))->toBe(900);
});

it('parses only hours', function (): void {
    expect(IsoDurationParser::toSeconds('PT2H'))->toBe(7200);
});

it('returns zero for invalid input', function (): void {
    expect(IsoDurationParser::toSeconds('P1D'))->toBe(0);
    expect(IsoDurationParser::toSeconds(''))->toBe(0);
    expect(IsoDurationParser::toSeconds('lixo'))->toBe(0);
});
