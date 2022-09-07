* Mark routine for Eratosthenes Sieve to find prime numbers
*
* Array is some storage that is (array size) long and the
* index is the last found prime
*
* This routine has to go through the array and mark off all the
* multiples of the index, updating the nibbles with a nonzero value
*
* Each byte in the array represents the two numbers either side of
* a multiple of 6 - the first byte is 5&7, the next 11&13 and so on
*
* For example, the array might be 10 bytes long and the first time
* this is called the index would be five - the last prime found
*
* Array would look like this at entry
*    00000000000000000000     size would be 10 and index 5
* Array should look like this at exit
*    0000000F00F000000F00
*    0 1 2 3 4 5 6 7 8 9
*    note that the value at the index is left as zero, and all
*    the multiples of 5 at bytes 3, 5 and 8 are updated to X'f'
*    (nibbles represent values of 25, 35 and 55)
* Logic flow
*
* .  Usual housekeeping (need to define usual)
*
* .  Mark routine
*      parameters  (all 4 byte values)
*      no 1  -> array            ( the -> implies it is a pointer)
*      no 2  Maximum value in array - example above this would be 61
*      no 3  Index value
*
* .  Normal exit
*
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
