const defaultPrograms = {
  "load register": `         l     1,a1          load register
         bcr   b'1111',14    return to caller
a1       dc    f'42'`,
  "loop de loop": `         l     1,a1
loop     bct   1,loop
         bcr   b'1111',14
a1       dc    f'20'`,
  max: `max      csect
         Using max,15
         l     1,w1          get First number
         l     2,w2          Get second number
         cr    1,2           set the condition code
         bc    b'0010',onehigh  branch if W1 higher
         st    2,w3          else store second number
         bcr   b'1111',14    return to caller
onehigh  st    1,w3          save first number as max
         bcr   b'1111',14    return to caller
w1       dc    f'321'        First number
w2       dc    f'123'        Second number
w3       ds    f             Maximum
         end   max
`,
  sprites: `sprite   csect                 
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
    
`,
};

const loadDefaultProgs = () => {
  const progs = [{ sprites: "spr1.asm" }, { scan6: "scan6.asm" }].map(
    ({ name, file }) => {}
  );
};

export default defaultPrograms;
