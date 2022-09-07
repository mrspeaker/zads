* Mark routine for Eratosthenes Sieve to find prime numbers

mark6    csect
         stm   r14,r12,12(r13)    save caller's registers
         lr    r12,r15            set up the base register
         using mark6,r12          and tell assembler

         lm    r2,r4,0(r1)        arr, maxnum, prime
         lr    r8,r4              copy prime

loop     ar    r8,r4              next prime multiple
         crbh  r8,r3,exit         past the end of array?
         lr    r7,r8              divide prime by 6
         m     r6,=f'1'           ...remainder in R6
         d     r6,=f'6'           ...quotient (idx) in R7

minus1   cibne r6,5,plus1         6x-1? (remainder 5)
         lr    r5,r2              copy arr
         ar    r5,r7              add idx (eg, 23/6=3r5 -> base + 3)
         oi    0(r5),x'F0'        set low nibble
         b     loop

plus1    cibne r6,1,loop          6x+1? (remainder 1)
         lr    r5,r2              copy arr
         ar    r5,r7              add idx. (eg, 25/6=4r1 -> base + 4)
         ahi   r5,-1              ...base+4 is one byte too far
         oi    0(r5),x'0F'        set hi nibble
         b     loop

exit     l     r14,12(,r13)
         lm    r2,r12,28(r13)
         bsm   0,r14

*
         ltorg

         asmdreg
         end   mark6
