import { seperateDateRange, subtractRanges } from './dates';

describe('subtract ranges', () => {
  it('should subtract unordered ranges of dates', () => {
    const subtrahend: [Date, Date] = [
      new Date('2022-01-01T00:00:00.000Z'),
      new Date('2022-01-01T01:00:00.000Z'),
    ];
    const minuends: [Date, Date][] = [
      [
        new Date('2022-01-01T00:00:00.000Z'),
        new Date('2022-01-01T00:30:00.000Z'),
      ],
      [
        new Date('2022-01-01T00:45:00.000Z'),
        new Date('2022-01-01T01:00:00.000Z'),
      ],
      [
        new Date('2022-01-01T00:35:00.000Z'),
        new Date('2022-01-01T00:40:00.000Z'),
      ],
    ];

    const result = subtractRanges(subtrahend, minuends);
    expect(result).toEqual([
      [
        new Date('2022-01-01T00:30:00.000Z'),
        new Date('2022-01-01T00:35:00.000Z'),
      ],
      [
        new Date('2022-01-01T00:40:00.000Z'),
        new Date('2022-01-01T00:45:00.000Z'),
      ],
    ]);
  });

  it('should fail if any ranges are invalid', () => {
    const subtrahend: [Date, Date] = [
      new Date('2022-01-01T00:00:00.000Z'),
      new Date('2022-01-01T01:00:00.000Z'),
    ];
    expect(() =>
      subtractRanges(
        [
          new Date('2022-01-01T01:00:00.000Z'),
          new Date('2022-01-01T00:00:00.000Z'),
        ],
        [],
      ),
    ).toThrow();
    expect(() =>
      subtractRanges(subtrahend, [
        [
          new Date('2022-01-01T00:30:00.000Z'),
          new Date('2022-01-01T00:00:00.000Z'),
        ],
      ]),
    ).toThrow();
  });

  it('should truncate minuend ranges to the subtrahend', () => {
    const subtrahend: [Date, Date] = [
      new Date('2022-01-01T00:00:00.000Z'),
      new Date('2022-01-01T00:30:00.000Z'),
    ];
    const minuends: [Date, Date][] = [
      [
        new Date('2021-01-01T00:00:00.000Z'),
        new Date('2022-01-01T00:40:00.000Z'),
      ],
      [
        new Date('2022-01-01T00:45:00.000Z'),
        new Date('2023-01-01T01:00:00.000Z'),
      ],
    ];

    const result = subtractRanges(subtrahend, minuends);
    expect(result).toEqual([]);
  });

  it('should truncate available ranges to the subtrahend', () => {
    const subtrahend: [Date, Date] = [
      new Date('2022-01-01T00:00:00.000Z'),
      new Date('2022-01-01T00:50:00.000Z'),
    ];
    const minuends: [Date, Date][] = [
      [
        new Date('2021-01-01T00:00:00.000Z'),
        new Date('2022-01-01T00:40:00.000Z'),
      ],
      [
        new Date('2022-01-01T00:55:00.000Z'),
        new Date('2022-01-01T01:00:00.000Z'),
      ],
    ];

    const result = subtractRanges(subtrahend, minuends);
    expect(result).toEqual([
      [
        new Date('2022-01-01T00:40:00.000Z'),
        new Date('2022-01-01T00:50:00.000Z'),
      ],
    ]);
  });
});

describe('seperateDateRange', () => {
  it('should split by ten minutes over twenty minute periods', () => {
    const result = seperateDateRange(
      [new Date('2022-01-01T00:00Z'), new Date('2022-01-01T00:30:00Z')],
      20 * 60,
      10 * 60,
    );
    expect(result).toEqual([
      [new Date('2022-01-01T00:00:00Z'), new Date('2022-01-01T00:20:00Z')],
      [new Date('2022-01-01T00:10:00Z'), new Date('2022-01-01T00:30:00Z')],
    ]);
  });

  it('should split by fifteen minutes over thirty minute periods', () => {
    const result = seperateDateRange(
      [new Date('2022-01-01T00:05Z'), new Date('2022-01-01T00:57Z')],
      30 * 60,
      15 * 60,
    );
    expect(result).toEqual([
      [new Date('2022-01-01T00:05Z'), new Date('2022-01-01T00:35Z')],
      [new Date('2022-01-01T00:20Z'), new Date('2022-01-01T00:50Z')],
    ]);
  });
});
