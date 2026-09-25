import { describe, expect, test } from "bun:test";
import { hash, hash2, permute } from "./poseidon2";

/**
 * The two implementations in this repository, checked against each other.
 *
 * `poseidon2.test.ts` and `test/Poseidon2Parity.t.sol` each check their own implementation against
 * vectors `nargo` produced. That is the right check and it has a gap: both suites assert the same
 * seven constants, so a case neither suite covers could diverge silently between TypeScript and
 * Solidity while both still pass.
 *
 * This closes it from the TypeScript side by asserting the Solidity suite's exact expectations
 * against the TypeScript implementation. If somebody edits one implementation and not the other,
 * the divergence surfaces here rather than in a commitment tree.
 *
 * The Solidity side has the same vectors in `test/Poseidon2Parity.t.sol`. Keeping the two lists
 * identical is the point; they are written out rather than generated so a diff shows it.
 */

describe("the Solidity suite's vectors, asserted against the TypeScript implementation", () => {
  test("permute([0,0,0,0])", () => {
    expect(permute([0n, 0n, 0n, 0n])[0]).toBe(
      0x18dfb8dc9b82229cff974efefc8df78b1ce96d9d844236b496785c698bc6732en,
    );
  });

  test("permute([1,2,3,4]) at both ends", () => {
    const r = permute([1n, 2n, 3n, 4n]);
    expect(r[0]).toBe(0x224785a48a72c75e2cbb698143e71d5d41bd89a2b9a7185871e39a54ce5785b1n);
    expect(r[3]).toBe(0x16c877b5b9c04d873218804ccbf65d0eeb12db447f66c9ca26fec380055df7e9n);
  });

  test("hash of one element", () => {
    expect(hash([1n])).toBe(0x168758332d5b3e2d13be8048c8011b454590e06c44bce7f702f09103eef5a373n);
  });

  test("hash of two elements", () => {
    expect(hash2(1n, 2n)).toBe(0x038682aa1cb5ae4e0a3f13da432a95c77c5c111f6f030faf9cad641ce1ed7383n);
  });

  test("hash of three elements — the case that fills the rate exactly", () => {
    // The one that separates a correct port from a plausible one, in either language.
    expect(hash([1n, 2n, 3n])).toBe(
      0x23864adb160dddf590f1d3303683ebcb914f828e2635f6e85a32f0a1aecd3dd8n,
    );
  });

  test("hash of four elements — spans two chunks", () => {
    expect(hash([1n, 2n, 3n, 4n])).toBe(
      0x130bf204a32cac1f0ace56c78b731aa3809f06df2731ebcf6b3464a15788b1b9n,
    );
  });

  test("hash of zeros", () => {
    expect(hash2(0n, 0n)).toBe(0x0b63a53787021a4a962a452c2921b3663aff1ffd8d5510540f8e659e782956f1n);
  });
});
