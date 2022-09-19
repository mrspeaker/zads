sprite   csect                 
         la    r6,vic
         mvi   11(,6),4     p1 col
         mvi   15(,6),3     p2 col
         mvi   19(,6),15    p1 x
         mvi   23(,6),15    p1 y
         mvi   31(,6),0     p2 y

         la    r7,screen    draw dots
         mvi   130(,r7),14
         mvi   131(,r7),13
         mvi   132(,r7),1
         mvi   133(,r7),13
         mvi   134(,r7),14
         
         l     3,zero
         l     4,thirty2
loop     ds    0
         xi    11(,r6),b'00001011'  flip col
         l     1,16(,6)     load spr x
         l     2,20(,6)     spr y

p2       l     5,28(,6)     get p2 y
         ahi   5,1
         cr    5,4          wrapping?
         bl    ok
         st    1,24(,6)     copy pl x  
         lr    5,3          wrap around
        
ok       st    5,228(,15)

         ch    3,236(,15)   is right?
         be    left
         ahi   1,1          
         
left     ch    3,232(,15)   is left?
         be    up
         ahi   1,-1

up       ch    3,240(,15)   is up?
         be    down
         ahi   2,-1

down     ch    3,244(,15)   is down?
         be    done
         ahi   2,1           
         
done     st    1,216(,15)   store x
         st    2,220(,15)   store y
  
         b     loop
exit     bcr   b'1111',14
    
zero     dc    f'0'
thirty2  dc    f'32'  

         asmdreg      
         end   sprite
 
