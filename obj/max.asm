max      csect
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
