* Scan routine for Eratosthenes Sieve to find prime numbers
*
scan6    csect
         stm   r14,r12,12(r13)    save caller's registers
         lr    r12,r15            set up the base register
         using scan6,r12           and tell assembler

         lm    r2,r4,0(r1)        arr, maxnum, cur_idx

loop     ahi   r4,2               next cur (skip evens)
         lr    r7,r4              divide idx by 6
         m     r6,=f'1'           ...remainder in R6
         d     r6,=f'6'

minus1   cibne r6,5,plus1         6x-1? (remainder 5)
         la    r5,0(r7,r2)        get the byte
         tm    0(r5),x'F0'        check low nibble
         bno   yepprime
         b     loop

plus1    cibne r6,1,loop          6x+1? (remainder 1)
         la    r5,0(r7,r2)        get the byte
         ahi   r5,-1              ...base+quot is 1 too far
         tm    0(r5),x'0F'        check hi nibble
         bno   yepprime
         ahi   r4,2               add 2 to get to next index
         b     loop               (eg, skip '9' go to '11)

yepprime lr    r1,r4

exit     l     r14,12(,r13)
         lm    r2,r12,28(r13)
         bsm   0,r14

         ltorg

         asmdreg
         end   scan6
