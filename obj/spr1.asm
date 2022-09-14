sprite   csect                 
         mvi   111(,15),4
         mvi   115(,15),2
         mvi   119(,15),15
         mvi   123(,15),15
         mvi   131(,15),0
         
         l     3,zero
loop     ds    0
         xi    111(,15),b'00001011'    
         l     1,116(,15)     load spr x
         l     2,120(,15)     spr y

         ch    3,136(,15)     is right?
         be    left
         ahi   1,1            add 1
         
left     ch    3,132(,15)     is left
         be    up
         ahi   1,-1

up       ch    3,140(,15)    is up?
         be    down
         ahi   2,-1

down     ch    3,144(,15)
         be    done
         ahi   2,1           
         
done     st    1,116(,15)     store x
         st    2,120(,15)     store y
  
         b     loop


         bcr   b'1111',14
zero     dc    f'0'
          
         end   sprite
    
