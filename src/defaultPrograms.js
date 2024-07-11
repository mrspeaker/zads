const defaultPrograms = {
  "01: load register": `*====== Loading registers =======

* Watch the registers as you step through the
* program.
* Press "assemble" then "run"
* (or "step" to single-step)

        l    1,num  load num into R1
        la   2,55
        lr   3,1    copy R1 to R3

done    bcr  b15,14

num     dc   f'42'`,
  "02: looping": `*====== Looping with branch-on-count =========
* Watch R1 as you step through the loop

        l    1,count  number of times to loop

loop    ds   0h
        bct  1,loop   go to loop

done    bcr  15,14  return

count   dc   f'10'
`,
  "03: cc": `* ========== condition codes ==========
* Watch the cc in the top right (or the
* execution output) to see the CC change
* based on comparison

        l    r1,num  loop 10 times

loop    ds   0h
        cfi  r1,5     check if 5 yet
        be   done     yes! finish...
        bct  r1,loop  else loop again

done    bcr  r15,r14  return

        asmdreg

num     dc   f'10'`,
  "04: output": `* ========== condition codes ==========
* outputting to the screen.
* 'screen' is a special symbol that points
* to the memory location for output.

        la   r2,screen

        l    r1,num
loop    ds   0h

        mvi  0(r2),1
        ahi  r2,1      screen += 1

        bct  r1,loop

done    bcr  r15,r14  return

        asmdreg

num     dc   f'256'`,
  "05: sprites": `*====== moving sprites =======

* draws a keyboard-controllable sprite using
* the image 'sprite 2', as well as another
* moving sprite from 'sprite 3'
* (Go to the drawing tab to change them)

    mvi spr0_idx,2  set img for sprite 0
    mvi spr0_x,60   put it in the middle
    mvi spr0_y,60   of the screen

    mvi spr1_idx,3  bad guy
    mvi spr1_y,8    at the top of the screen

    mvc screen(255),maps  copy the map

loop    ds 0h

    ic  4,spr0_x    get player pos
    ic  5,spr0_y

    ic  3,key_right  key right?
    cfi 3,1
    bne no_r
    ahi 4,1
    b moved

no_r ic 3,key_left  key left?
    cfi 3,1
    bne no_l
    ahi 4,-1
    b moved

no_l ic 3,key_up    key up?
    cfi 3,1
    bne no_u
    ahi 5,-1
    b moved

no_u ic 3,key_down   key down?
    cfi 3,1
    bne moved
    ahi 5,1

moved ds 0h
    stc 4,spr0_x     set pos in memory
    stc 5,spr0_y

    ic  3,spr1_x     move the baddie
    ahi 3,1
    ch  3,edge       wrap if too far
    bl  done
    la  3,0

done ds 0h
    stc 3,spr1_x

    b  loop

edge dc f'128'
`,
};

export default defaultPrograms;
