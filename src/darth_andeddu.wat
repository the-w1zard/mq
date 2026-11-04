(module
  ;; Export a 64KB linear memory page (expands as needed)
  (memory (export "memory") 1)

  ;; High-speed pass loop function
  ;; Arguments: (param $len i32) (param $tracerPid i32)
  (func (export "passLoop") (param $len i32) (param $tracerPid i32)
    (local $i i32)
    (local $pid i32)
    
    (local.set $i (i32.const 0))

    (block $break
      (loop $continue
        ;; Break if $i >= $len
        (br_if $break (i32.ge_u (local.get $i) (local.get $len)))

        ;; Load PID from lane array (each int32 is 4 bytes -> address = $i * 4)
        (local.set $pid 
          (i32.load 
            (i32.mul (local.get $i) (i32.const 4))
          )
        )

        ;; If pid === tracerPid, do work...
        (if (i32.eq (local.get $pid) (local.get $tracerPid))
          (then
            ;; Increment tracer or mutate state directly in memory
          )
        )

        ;; Increment loop index and repeat
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $continue)
      )
    )
  )
)
