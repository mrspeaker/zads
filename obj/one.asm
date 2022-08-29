Node     dsect
Left     ds    A
Right    ds    A
Name     ds    CL10
NodeLen  equ   *-Node

one      csect
         stm   r14,r12,12(r13)    save caller's registers
         lr    r12,r15            set up the base register
         using one,r12          and tell assembler

         lm    r2,r4,0(r1)        arr, maxnum, prime
         
         la    r5,data
N1       using Node,r5
         xc    N1.Left,N1.Left
         xc    N1.Right,N1.Right
         
         la    r6,NodeLen(,r5) 
N2       using Node,r6
         xc    N2.Left,N2.Left
         xc    N2.Right,N2.Right    
         st    r5,N2.Left
         
         printout r5,r6

exit     l     r14,12(,r13)
         lm    r2,r12,28(r13)
         bsm   0,r14

*
         ltorg

data     ds    cl256

         asmdreg
         end   one
