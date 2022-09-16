sprite   csect                 
         mvi   211(,15),4
         mvi   215(,15),3
         mvi   219(,15),15
         mvi   223(,15),15
         mvi   231(,15),0
         
         l     3,zero
         l     4,thirty2
loop     ds    0
         xi    211(,15),b'00001011'    
         l     1,216(,15)     load spr x
         l     2,220(,15)     spr y

p2       l     5,228(,15)
         ahi   5,1
         cr    5,4
         bl    ok
         lr    5,3            wrap around
ok       st    5,228(,15)

         ch    3,236(,15)     is right?
         be    left
         ahi   1,1            add 1
         
left     ch    3,232(,15)     is left
         be    up
         ahi   1,-1

up       ch    3,240(,15)    is up?
         be    down
         ahi   2,-1

down     ch    3,244(,15)
         be    done
         ahi   2,1           
         
done     st    1,216(,15)     store x
         st    2,220(,15)     store y
  
         b     loop


         bcr   b'1111',14
zero     dc    f'0'
thirty2  dc    f'32'        
         end   sprite
    
