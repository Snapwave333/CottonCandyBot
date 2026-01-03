/**
 * Safe Math Utility for Solana Trading
 * Prevents floating point errors by using integer arithmetic (Lamports).
 * 1 SOL = 1,000,000,000 Lamports
 */

export const LAMPORTS_PER_SOL = 1_000_000_000;

export const safeMath = {
  /**
   * Converts SOL to Lamports (Integer)
   */
  toLamports: (sol: number): number => {
    return Math.floor(sol * LAMPORTS_PER_SOL);
  },

  /**
   * Converts Lamports to SOL (Float)
   */
  fromLamports: (lamports: number): number => {
    return lamports / LAMPORTS_PER_SOL;
  },

  /**
   * Safe Addition (a + b)
   */
  add: (a: number, b: number): number => {
    const aLam = safeMath.toLamports(a);
    const bLam = safeMath.toLamports(b);
    return safeMath.fromLamports(aLam + bLam);
  },

  /**
   * Safe Subtraction (a - b)
   */
  sub: (a: number, b: number): number => {
    const aLam = safeMath.toLamports(a);
    const bLam = safeMath.toLamports(b);
    return safeMath.fromLamports(aLam - bLam);
  },

  /**
   * Safe Multiplication (a * b)
   */
  mul: (a: number, b: number): number => {
    // Multiplication can be tricky with scaling, but for simple scalars:
    // If b is a scalar (e.g. 0.5), we multiply lamports by b.
    const aLam = safeMath.toLamports(a);
    return safeMath.fromLamports(Math.floor(aLam * b));
  },

  /**
   * Safe Division (a / b)
   */
  div: (a: number, b: number): number => {
    // Division by scalar
    const aLam = safeMath.toLamports(a);
    return safeMath.fromLamports(Math.floor(aLam / b));
  }
};
