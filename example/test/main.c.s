	.text
	.def	@feat.00;
	.scl	3;
	.type	0;
	.endef
	.globl	@feat.00
.set @feat.00, 0
	.file	"main.c"
	.def	sprintf;
	.scl	2;
	.type	32;
	.endef
	.section	.text,"xr",discard,sprintf
	.globl	sprintf                         # -- Begin function sprintf
	.p2align	4, 0x90
sprintf:                                # @sprintf
.Lfunc_begin0:
	.cv_func_id 0
	.cv_file	1 "C:\\Program Files (x86)\\Windows Kits\\10\\Include\\10.0.22621.0\\ucrt\\stdio.h"
	.cv_loc	0 1 1771 0                      # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:1771:0
.seh_proc sprintf
# %bb.0:
	subq	$72, %rsp
	.seh_stackalloc 72
	.seh_endprologue
	movq	%r9, 104(%rsp)
	movq	%r8, 96(%rsp)
	movq	%rdx, 64(%rsp)
	movq	%rcx, 56(%rsp)
	leaq	96(%rsp), %rax
.Ltmp0:
	.cv_loc	0 1 1774 0                      # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:1774:0
	movq	%rax, 40(%rsp)
	.cv_loc	0 1 1776 0                      # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:1776:0
	movq	40(%rsp), %r9
	movq	64(%rsp), %rdx
	movq	56(%rsp), %rcx
	xorl	%eax, %eax
	movl	%eax, %r8d
	callq	_vsprintf_l
	movl	%eax, 52(%rsp)
	.cv_loc	0 1 1779 0                      # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:1779:0
	movl	52(%rsp), %eax
	addq	$72, %rsp
	retq
.Ltmp1:
.Lfunc_end0:
	.seh_endproc
                                        # -- End function
	.def	vsprintf;
	.scl	2;
	.type	32;
	.endef
	.section	.text,"xr",discard,vsprintf
	.globl	vsprintf                        # -- Begin function vsprintf
	.p2align	4, 0x90
vsprintf:                               # @vsprintf
.Lfunc_begin1:
	.cv_func_id 1
	.cv_loc	1 1 1473 0                      # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:1473:0
.seh_proc vsprintf
# %bb.0:
	subq	$72, %rsp
	.seh_stackalloc 72
	.seh_endprologue
	movq	%r8, 64(%rsp)
	movq	%rdx, 56(%rsp)
	movq	%rcx, 48(%rsp)
.Ltmp2:
	.cv_loc	1 1 1474 0                      # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:1474:0
	movq	64(%rsp), %rax
	movq	56(%rsp), %r8
	movq	48(%rsp), %rcx
	movq	$-1, %rdx
	xorl	%r9d, %r9d
                                        # kill: def $r9 killed $r9d
	movq	%rax, 32(%rsp)
	callq	_vsnprintf_l
	nop
	addq	$72, %rsp
	retq
.Ltmp3:
.Lfunc_end1:
	.seh_endproc
                                        # -- End function
	.def	_snprintf;
	.scl	2;
	.type	32;
	.endef
	.section	.text,"xr",discard,_snprintf
	.globl	_snprintf                       # -- Begin function _snprintf
	.p2align	4, 0x90
_snprintf:                              # @_snprintf
.Lfunc_begin2:
	.cv_func_id 2
	.cv_loc	2 1 1947 0                      # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:1947:0
.seh_proc _snprintf
# %bb.0:
	subq	$72, %rsp
	.seh_stackalloc 72
	.seh_endprologue
	movq	%r9, 104(%rsp)
	movq	%r8, 64(%rsp)
	movq	%rdx, 56(%rsp)
	movq	%rcx, 48(%rsp)
	leaq	104(%rsp), %rax
.Ltmp4:
	.cv_loc	2 1 1950 0                      # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:1950:0
	movq	%rax, 32(%rsp)
	.cv_loc	2 1 1951 0                      # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:1951:0
	movq	32(%rsp), %r9
	movq	64(%rsp), %r8
	movq	56(%rsp), %rdx
	movq	48(%rsp), %rcx
	callq	_vsnprintf
	movl	%eax, 44(%rsp)
	.cv_loc	2 1 1953 0                      # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:1953:0
	movl	44(%rsp), %eax
	addq	$72, %rsp
	retq
.Ltmp5:
.Lfunc_end2:
	.seh_endproc
                                        # -- End function
	.def	_vsnprintf;
	.scl	2;
	.type	32;
	.endef
	.section	.text,"xr",discard,_vsnprintf
	.globl	_vsnprintf                      # -- Begin function _vsnprintf
	.p2align	4, 0x90
_vsnprintf:                             # @_vsnprintf
.Lfunc_begin3:
	.cv_func_id 3
	.cv_loc	3 1 1411 0                      # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:1411:0
.seh_proc _vsnprintf
# %bb.0:
	subq	$72, %rsp
	.seh_stackalloc 72
	.seh_endprologue
	movq	%r9, 64(%rsp)
	movq	%r8, 56(%rsp)
	movq	%rdx, 48(%rsp)
	movq	%rcx, 40(%rsp)
.Ltmp6:
	.cv_loc	3 1 1412 0                      # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:1412:0
	movq	64(%rsp), %rax
	movq	56(%rsp), %r8
	movq	48(%rsp), %rdx
	movq	40(%rsp), %rcx
	xorl	%r9d, %r9d
                                        # kill: def $r9 killed $r9d
	movq	%rax, 32(%rsp)
	callq	_vsnprintf_l
	nop
	addq	$72, %rsp
	retq
.Ltmp7:
.Lfunc_end3:
	.seh_endproc
                                        # -- End function
	.def	main;
	.scl	2;
	.type	32;
	.endef
	.text
	.globl	main                            # -- Begin function main
	.p2align	4, 0x90
main:                                   # @main
.Lfunc_begin4:
	.cv_func_id 4
	.cv_file	2 "h:\\Workspace\\vscode-llvm\\example\\test\\main.c"
	.cv_loc	4 2 3 0                         # test/main.c:3:0
.seh_proc main
# %bb.0:
	subq	$56, %rsp
	.seh_stackalloc 56
	.seh_endprologue
	movl	$0, 52(%rsp)
	movq	%rdx, 40(%rsp)
	movl	%ecx, 36(%rsp)
.Ltmp8:
	.cv_loc	4 2 4 0                         # test/main.c:4:0
	leaq	"??_C@_06NJBIDDBG@Hello?6?$AA@"(%rip), %rcx
	callq	printf
	.cv_loc	4 2 5 0                         # test/main.c:5:0
	leaq	"??_C@_06DKJADKFF@World?6?$AA@"(%rip), %rcx
	callq	printf
	.cv_loc	4 2 6 0                         # test/main.c:6:0
	xorl	%eax, %eax
	addq	$56, %rsp
	retq
.Ltmp9:
.Lfunc_end4:
	.seh_endproc
                                        # -- End function
	.def	printf;
	.scl	2;
	.type	32;
	.endef
	.section	.text,"xr",discard,printf
	.globl	printf                          # -- Begin function printf
	.p2align	4, 0x90
printf:                                 # @printf
.Lfunc_begin5:
	.cv_func_id 5
	.cv_loc	5 1 956 0                       # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:956:0
.seh_proc printf
# %bb.0:
	subq	$72, %rsp
	.seh_stackalloc 72
	.seh_endprologue
	movq	%r9, 104(%rsp)
	movq	%r8, 96(%rsp)
	movq	%rdx, 88(%rsp)
	movq	%rcx, 64(%rsp)
	leaq	88(%rsp), %rax
.Ltmp10:
	.cv_loc	5 1 959 0                       # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:959:0
	movq	%rax, 48(%rsp)
	.cv_loc	5 1 960 0                       # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:960:0
	movq	48(%rsp), %rax
	movq	%rax, 40(%rsp)                  # 8-byte Spill
	movq	64(%rsp), %rax
	movq	%rax, 32(%rsp)                  # 8-byte Spill
	movl	$1, %ecx
	callq	__acrt_iob_func
	movq	32(%rsp), %rdx                  # 8-byte Reload
	movq	40(%rsp), %r9                   # 8-byte Reload
	movq	%rax, %rcx
	xorl	%eax, %eax
	movl	%eax, %r8d
	callq	_vfprintf_l
	movl	%eax, 60(%rsp)
	.cv_loc	5 1 962 0                       # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:962:0
	movl	60(%rsp), %eax
	addq	$72, %rsp
	retq
.Ltmp11:
.Lfunc_end5:
	.seh_endproc
                                        # -- End function
	.def	_vsprintf_l;
	.scl	2;
	.type	32;
	.endef
	.section	.text,"xr",discard,_vsprintf_l
	.globl	_vsprintf_l                     # -- Begin function _vsprintf_l
	.p2align	4, 0x90
_vsprintf_l:                            # @_vsprintf_l
.Lfunc_begin6:
	.cv_func_id 6
	.cv_loc	6 1 1458 0                      # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:1458:0
.seh_proc _vsprintf_l
# %bb.0:
	subq	$72, %rsp
	.seh_stackalloc 72
	.seh_endprologue
	movq	%r9, 64(%rsp)
	movq	%r8, 56(%rsp)
	movq	%rdx, 48(%rsp)
	movq	%rcx, 40(%rsp)
.Ltmp12:
	.cv_loc	6 1 1459 0                      # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:1459:0
	movq	64(%rsp), %rax
	movq	56(%rsp), %r9
	movq	48(%rsp), %r8
	movq	40(%rsp), %rcx
	movq	$-1, %rdx
	movq	%rax, 32(%rsp)
	callq	_vsnprintf_l
	nop
	addq	$72, %rsp
	retq
.Ltmp13:
.Lfunc_end6:
	.seh_endproc
                                        # -- End function
	.def	_vsnprintf_l;
	.scl	2;
	.type	32;
	.endef
	.section	.text,"xr",discard,_vsnprintf_l
	.globl	_vsnprintf_l                    # -- Begin function _vsnprintf_l
	.p2align	4, 0x90
_vsnprintf_l:                           # @_vsnprintf_l
.Lfunc_begin7:
	.cv_func_id 7
	.cv_loc	7 1 1391 0                      # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:1391:0
.seh_proc _vsnprintf_l
# %bb.0:
	subq	$136, %rsp
	.seh_stackalloc 136
	.seh_endprologue
	movq	176(%rsp), %rax
	movq	%r9, 128(%rsp)
	movq	%r8, 120(%rsp)
	movq	%rdx, 112(%rsp)
	movq	%rcx, 104(%rsp)
.Ltmp14:
	.cv_loc	7 1 1392 0                      # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:1392:0
	movq	176(%rsp), %rax
	movq	%rax, 88(%rsp)                  # 8-byte Spill
	movq	128(%rsp), %rax
	movq	%rax, 80(%rsp)                  # 8-byte Spill
	movq	120(%rsp), %rax
	movq	%rax, 72(%rsp)                  # 8-byte Spill
	movq	112(%rsp), %rax
	movq	%rax, 64(%rsp)                  # 8-byte Spill
	movq	104(%rsp), %rax
	movq	%rax, 56(%rsp)                  # 8-byte Spill
	callq	__local_stdio_printf_options
	movq	56(%rsp), %rdx                  # 8-byte Reload
	movq	64(%rsp), %r8                   # 8-byte Reload
	movq	72(%rsp), %r9                   # 8-byte Reload
	movq	80(%rsp), %r10                  # 8-byte Reload
	movq	%rax, %rcx
	movq	88(%rsp), %rax                  # 8-byte Reload
	movq	(%rcx), %rcx
	orq	$1, %rcx
	movq	%r10, 32(%rsp)
	movq	%rax, 40(%rsp)
	callq	__stdio_common_vsprintf
	movl	%eax, 100(%rsp)
	.cv_loc	7 1 1396 0                      # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:1396:0
	cmpl	$0, 100(%rsp)
	jge	.LBB7_2
# %bb.1:
	movl	$4294967295, %eax               # imm = 0xFFFFFFFF
	movl	%eax, 52(%rsp)                  # 4-byte Spill
	jmp	.LBB7_3
.LBB7_2:
	movl	100(%rsp), %eax
	movl	%eax, 52(%rsp)                  # 4-byte Spill
.LBB7_3:
	movl	52(%rsp), %eax                  # 4-byte Reload
	addq	$136, %rsp
	retq
.Ltmp15:
.Lfunc_end7:
	.seh_endproc
                                        # -- End function
	.def	__local_stdio_printf_options;
	.scl	2;
	.type	32;
	.endef
	.section	.text,"xr",discard,__local_stdio_printf_options
	.globl	__local_stdio_printf_options    # -- Begin function __local_stdio_printf_options
	.p2align	4, 0x90
__local_stdio_printf_options:           # @__local_stdio_printf_options
.Lfunc_begin8:
	.cv_func_id 8
# %bb.0:
	.cv_file	3 "C:\\Program Files (x86)\\Windows Kits\\10\\Include\\10.0.22621.0\\ucrt\\corecrt_stdio_config.h"
	.cv_loc	8 3 92 0                        # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\corecrt_stdio_config.h:92:0
	leaq	__local_stdio_printf_options._OptionsStorage(%rip), %rax
	retq
.Ltmp16:
.Lfunc_end8:
                                        # -- End function
	.def	_vfprintf_l;
	.scl	2;
	.type	32;
	.endef
	.section	.text,"xr",discard,_vfprintf_l
	.globl	_vfprintf_l                     # -- Begin function _vfprintf_l
	.p2align	4, 0x90
_vfprintf_l:                            # @_vfprintf_l
.Lfunc_begin9:
	.cv_func_id 9
	.cv_loc	9 1 644 0                       # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:644:0
.seh_proc _vfprintf_l
# %bb.0:
	subq	$104, %rsp
	.seh_stackalloc 104
	.seh_endprologue
	movq	%r9, 96(%rsp)
	movq	%r8, 88(%rsp)
	movq	%rdx, 80(%rsp)
	movq	%rcx, 72(%rsp)
.Ltmp17:
	.cv_loc	9 1 645 0                       # C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\stdio.h:645:0
	movq	96(%rsp), %rax
	movq	%rax, 64(%rsp)                  # 8-byte Spill
	movq	88(%rsp), %rax
	movq	%rax, 56(%rsp)                  # 8-byte Spill
	movq	80(%rsp), %rax
	movq	%rax, 48(%rsp)                  # 8-byte Spill
	movq	72(%rsp), %rax
	movq	%rax, 40(%rsp)                  # 8-byte Spill
	callq	__local_stdio_printf_options
	movq	40(%rsp), %rdx                  # 8-byte Reload
	movq	48(%rsp), %r8                   # 8-byte Reload
	movq	56(%rsp), %r9                   # 8-byte Reload
	movq	%rax, %rcx
	movq	64(%rsp), %rax                  # 8-byte Reload
	movq	(%rcx), %rcx
	movq	%rax, 32(%rsp)
	callq	__stdio_common_vfprintf
	nop
	addq	$104, %rsp
	retq
.Ltmp18:
.Lfunc_end9:
	.seh_endproc
                                        # -- End function
	.section	.rdata,"dr",discard,"??_C@_06NJBIDDBG@Hello?6?$AA@"
	.globl	"??_C@_06NJBIDDBG@Hello?6?$AA@" # @"??_C@_06NJBIDDBG@Hello?6?$AA@"
"??_C@_06NJBIDDBG@Hello?6?$AA@":
	.asciz	"Hello\n"

	.section	.rdata,"dr",discard,"??_C@_06DKJADKFF@World?6?$AA@"
	.globl	"??_C@_06DKJADKFF@World?6?$AA@" # @"??_C@_06DKJADKFF@World?6?$AA@"
"??_C@_06DKJADKFF@World?6?$AA@":
	.asciz	"World\n"

	.lcomm	__local_stdio_printf_options._OptionsStorage,8,8 # @__local_stdio_printf_options._OptionsStorage
	.section	.debug$S,"dr"
	.p2align	2, 0x0
	.long	4                               # Debug section magic
	.long	241
	.long	.Ltmp20-.Ltmp19                 # Subsection size
.Ltmp19:
	.short	.Ltmp22-.Ltmp21                 # Record length
.Ltmp21:
	.short	4353                            # Record kind: S_OBJNAME
	.long	0                               # Signature
	.byte	0                               # Object name
	.p2align	2, 0x0
.Ltmp22:
	.short	.Ltmp24-.Ltmp23                 # Record length
.Ltmp23:
	.short	4412                            # Record kind: S_COMPILE3
	.long	0                               # Flags and language
	.short	208                             # CPUType
	.short	16                              # Frontend version
	.short	0
	.short	6
	.short	0
	.short	16006                           # Backend version
	.short	0
	.short	0
	.short	0
	.asciz	"clang version 16.0.6"          # Null-terminated compiler version string
	.p2align	2, 0x0
.Ltmp24:
.Ltmp20:
	.p2align	2, 0x0
	.section	.debug$S,"dr",associative,sprintf
	.p2align	2, 0x0
	.long	4                               # Debug section magic
	.long	241                             # Symbol subsection for sprintf
	.long	.Ltmp26-.Ltmp25                 # Subsection size
.Ltmp25:
	.short	.Ltmp28-.Ltmp27                 # Record length
.Ltmp27:
	.short	4423                            # Record kind: S_GPROC32_ID
	.long	0                               # PtrParent
	.long	0                               # PtrEnd
	.long	0                               # PtrNext
	.long	.Lfunc_end0-sprintf             # Code size
	.long	0                               # Offset after prologue
	.long	0                               # Offset before epilogue
	.long	4101                            # Function type index
	.secrel32	sprintf                 # Function section relative address
	.secidx	sprintf                         # Function section index
	.byte	0                               # Flags
	.asciz	"sprintf"                       # Function name
	.p2align	2, 0x0
.Ltmp28:
	.short	.Ltmp30-.Ltmp29                 # Record length
.Ltmp29:
	.short	4114                            # Record kind: S_FRAMEPROC
	.long	72                              # FrameSize
	.long	0                               # Padding
	.long	0                               # Offset of padding
	.long	0                               # Bytes of callee saved registers
	.long	0                               # Exception handler offset
	.short	0                               # Exception handler section
	.long	90112                           # Flags (defines frame register)
	.p2align	2, 0x0
.Ltmp30:
	.short	.Ltmp32-.Ltmp31                 # Record length
.Ltmp31:
	.short	4414                            # Record kind: S_LOCAL
	.long	4096                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_Buffer"
	.p2align	2, 0x0
.Ltmp32:
	.cv_def_range	 .Ltmp0 .Ltmp1, frame_ptr_rel, 56
	.short	.Ltmp34-.Ltmp33                 # Record length
.Ltmp33:
	.short	4414                            # Record kind: S_LOCAL
	.long	4098                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_Format"
	.p2align	2, 0x0
.Ltmp34:
	.cv_def_range	 .Ltmp0 .Ltmp1, frame_ptr_rel, 64
	.short	.Ltmp36-.Ltmp35                 # Record length
.Ltmp35:
	.short	4414                            # Record kind: S_LOCAL
	.long	116                             # TypeIndex
	.short	0                               # Flags
	.asciz	"_Result"
	.p2align	2, 0x0
.Ltmp36:
	.cv_def_range	 .Ltmp0 .Ltmp1, frame_ptr_rel, 52
	.short	.Ltmp38-.Ltmp37                 # Record length
.Ltmp37:
	.short	4414                            # Record kind: S_LOCAL
	.long	1648                            # TypeIndex
	.short	0                               # Flags
	.asciz	"_ArgList"
	.p2align	2, 0x0
.Ltmp38:
	.cv_def_range	 .Ltmp0 .Ltmp1, frame_ptr_rel, 40
	.short	2                               # Record length
	.short	4431                            # Record kind: S_PROC_ID_END
.Ltmp26:
	.p2align	2, 0x0
	.cv_linetable	0, sprintf, .Lfunc_end0
	.section	.debug$S,"dr",associative,vsprintf
	.p2align	2, 0x0
	.long	4                               # Debug section magic
	.long	241                             # Symbol subsection for vsprintf
	.long	.Ltmp40-.Ltmp39                 # Subsection size
.Ltmp39:
	.short	.Ltmp42-.Ltmp41                 # Record length
.Ltmp41:
	.short	4423                            # Record kind: S_GPROC32_ID
	.long	0                               # PtrParent
	.long	0                               # PtrEnd
	.long	0                               # PtrNext
	.long	.Lfunc_end1-vsprintf            # Code size
	.long	0                               # Offset after prologue
	.long	0                               # Offset before epilogue
	.long	4104                            # Function type index
	.secrel32	vsprintf                # Function section relative address
	.secidx	vsprintf                        # Function section index
	.byte	0                               # Flags
	.asciz	"vsprintf"                      # Function name
	.p2align	2, 0x0
.Ltmp42:
	.short	.Ltmp44-.Ltmp43                 # Record length
.Ltmp43:
	.short	4114                            # Record kind: S_FRAMEPROC
	.long	72                              # FrameSize
	.long	0                               # Padding
	.long	0                               # Offset of padding
	.long	0                               # Bytes of callee saved registers
	.long	0                               # Exception handler offset
	.short	0                               # Exception handler section
	.long	90112                           # Flags (defines frame register)
	.p2align	2, 0x0
.Ltmp44:
	.short	.Ltmp46-.Ltmp45                 # Record length
.Ltmp45:
	.short	4414                            # Record kind: S_LOCAL
	.long	4096                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_Buffer"
	.p2align	2, 0x0
.Ltmp46:
	.cv_def_range	 .Ltmp2 .Ltmp3, frame_ptr_rel, 48
	.short	.Ltmp48-.Ltmp47                 # Record length
.Ltmp47:
	.short	4414                            # Record kind: S_LOCAL
	.long	4098                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_Format"
	.p2align	2, 0x0
.Ltmp48:
	.cv_def_range	 .Ltmp2 .Ltmp3, frame_ptr_rel, 56
	.short	.Ltmp50-.Ltmp49                 # Record length
.Ltmp49:
	.short	4414                            # Record kind: S_LOCAL
	.long	1648                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_ArgList"
	.p2align	2, 0x0
.Ltmp50:
	.cv_def_range	 .Ltmp2 .Ltmp3, frame_ptr_rel, 64
	.short	2                               # Record length
	.short	4431                            # Record kind: S_PROC_ID_END
.Ltmp40:
	.p2align	2, 0x0
	.cv_linetable	1, vsprintf, .Lfunc_end1
	.section	.debug$S,"dr",associative,_snprintf
	.p2align	2, 0x0
	.long	4                               # Debug section magic
	.long	241                             # Symbol subsection for _snprintf
	.long	.Ltmp52-.Ltmp51                 # Subsection size
.Ltmp51:
	.short	.Ltmp54-.Ltmp53                 # Record length
.Ltmp53:
	.short	4423                            # Record kind: S_GPROC32_ID
	.long	0                               # PtrParent
	.long	0                               # PtrEnd
	.long	0                               # PtrNext
	.long	.Lfunc_end2-_snprintf           # Code size
	.long	0                               # Offset after prologue
	.long	0                               # Offset before epilogue
	.long	4108                            # Function type index
	.secrel32	_snprintf               # Function section relative address
	.secidx	_snprintf                       # Function section index
	.byte	0                               # Flags
	.asciz	"_snprintf"                     # Function name
	.p2align	2, 0x0
.Ltmp54:
	.short	.Ltmp56-.Ltmp55                 # Record length
.Ltmp55:
	.short	4114                            # Record kind: S_FRAMEPROC
	.long	72                              # FrameSize
	.long	0                               # Padding
	.long	0                               # Offset of padding
	.long	0                               # Bytes of callee saved registers
	.long	0                               # Exception handler offset
	.short	0                               # Exception handler section
	.long	90112                           # Flags (defines frame register)
	.p2align	2, 0x0
.Ltmp56:
	.short	.Ltmp58-.Ltmp57                 # Record length
.Ltmp57:
	.short	4414                            # Record kind: S_LOCAL
	.long	4096                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_Buffer"
	.p2align	2, 0x0
.Ltmp58:
	.cv_def_range	 .Ltmp4 .Ltmp5, frame_ptr_rel, 48
	.short	.Ltmp60-.Ltmp59                 # Record length
.Ltmp59:
	.short	4414                            # Record kind: S_LOCAL
	.long	4105                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_BufferCount"
	.p2align	2, 0x0
.Ltmp60:
	.cv_def_range	 .Ltmp4 .Ltmp5, frame_ptr_rel, 56
	.short	.Ltmp62-.Ltmp61                 # Record length
.Ltmp61:
	.short	4414                            # Record kind: S_LOCAL
	.long	4098                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_Format"
	.p2align	2, 0x0
.Ltmp62:
	.cv_def_range	 .Ltmp4 .Ltmp5, frame_ptr_rel, 64
	.short	.Ltmp64-.Ltmp63                 # Record length
.Ltmp63:
	.short	4414                            # Record kind: S_LOCAL
	.long	116                             # TypeIndex
	.short	0                               # Flags
	.asciz	"_Result"
	.p2align	2, 0x0
.Ltmp64:
	.cv_def_range	 .Ltmp4 .Ltmp5, frame_ptr_rel, 44
	.short	.Ltmp66-.Ltmp65                 # Record length
.Ltmp65:
	.short	4414                            # Record kind: S_LOCAL
	.long	1648                            # TypeIndex
	.short	0                               # Flags
	.asciz	"_ArgList"
	.p2align	2, 0x0
.Ltmp66:
	.cv_def_range	 .Ltmp4 .Ltmp5, frame_ptr_rel, 32
	.short	2                               # Record length
	.short	4431                            # Record kind: S_PROC_ID_END
.Ltmp52:
	.p2align	2, 0x0
	.cv_linetable	2, _snprintf, .Lfunc_end2
	.section	.debug$S,"dr",associative,_vsnprintf
	.p2align	2, 0x0
	.long	4                               # Debug section magic
	.long	241                             # Symbol subsection for _vsnprintf
	.long	.Ltmp68-.Ltmp67                 # Subsection size
.Ltmp67:
	.short	.Ltmp70-.Ltmp69                 # Record length
.Ltmp69:
	.short	4423                            # Record kind: S_GPROC32_ID
	.long	0                               # PtrParent
	.long	0                               # PtrEnd
	.long	0                               # PtrNext
	.long	.Lfunc_end3-_vsnprintf          # Code size
	.long	0                               # Offset after prologue
	.long	0                               # Offset before epilogue
	.long	4111                            # Function type index
	.secrel32	_vsnprintf              # Function section relative address
	.secidx	_vsnprintf                      # Function section index
	.byte	0                               # Flags
	.asciz	"_vsnprintf"                    # Function name
	.p2align	2, 0x0
.Ltmp70:
	.short	.Ltmp72-.Ltmp71                 # Record length
.Ltmp71:
	.short	4114                            # Record kind: S_FRAMEPROC
	.long	72                              # FrameSize
	.long	0                               # Padding
	.long	0                               # Offset of padding
	.long	0                               # Bytes of callee saved registers
	.long	0                               # Exception handler offset
	.short	0                               # Exception handler section
	.long	90112                           # Flags (defines frame register)
	.p2align	2, 0x0
.Ltmp72:
	.short	.Ltmp74-.Ltmp73                 # Record length
.Ltmp73:
	.short	4414                            # Record kind: S_LOCAL
	.long	4096                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_Buffer"
	.p2align	2, 0x0
.Ltmp74:
	.cv_def_range	 .Ltmp6 .Ltmp7, frame_ptr_rel, 40
	.short	.Ltmp76-.Ltmp75                 # Record length
.Ltmp75:
	.short	4414                            # Record kind: S_LOCAL
	.long	4105                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_BufferCount"
	.p2align	2, 0x0
.Ltmp76:
	.cv_def_range	 .Ltmp6 .Ltmp7, frame_ptr_rel, 48
	.short	.Ltmp78-.Ltmp77                 # Record length
.Ltmp77:
	.short	4414                            # Record kind: S_LOCAL
	.long	4098                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_Format"
	.p2align	2, 0x0
.Ltmp78:
	.cv_def_range	 .Ltmp6 .Ltmp7, frame_ptr_rel, 56
	.short	.Ltmp80-.Ltmp79                 # Record length
.Ltmp79:
	.short	4414                            # Record kind: S_LOCAL
	.long	1648                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_ArgList"
	.p2align	2, 0x0
.Ltmp80:
	.cv_def_range	 .Ltmp6 .Ltmp7, frame_ptr_rel, 64
	.short	2                               # Record length
	.short	4431                            # Record kind: S_PROC_ID_END
.Ltmp68:
	.p2align	2, 0x0
	.cv_linetable	3, _vsnprintf, .Lfunc_end3
	.section	.debug$S,"dr"
	.long	241                             # Symbol subsection for main
	.long	.Ltmp82-.Ltmp81                 # Subsection size
.Ltmp81:
	.short	.Ltmp84-.Ltmp83                 # Record length
.Ltmp83:
	.short	4423                            # Record kind: S_GPROC32_ID
	.long	0                               # PtrParent
	.long	0                               # PtrEnd
	.long	0                               # PtrNext
	.long	.Lfunc_end4-main                # Code size
	.long	0                               # Offset after prologue
	.long	0                               # Offset before epilogue
	.long	4115                            # Function type index
	.secrel32	main                    # Function section relative address
	.secidx	main                            # Function section index
	.byte	0                               # Flags
	.asciz	"main"                          # Function name
	.p2align	2, 0x0
.Ltmp84:
	.short	.Ltmp86-.Ltmp85                 # Record length
.Ltmp85:
	.short	4114                            # Record kind: S_FRAMEPROC
	.long	56                              # FrameSize
	.long	0                               # Padding
	.long	0                               # Offset of padding
	.long	0                               # Bytes of callee saved registers
	.long	0                               # Exception handler offset
	.short	0                               # Exception handler section
	.long	90112                           # Flags (defines frame register)
	.p2align	2, 0x0
.Ltmp86:
	.short	.Ltmp88-.Ltmp87                 # Record length
.Ltmp87:
	.short	4414                            # Record kind: S_LOCAL
	.long	116                             # TypeIndex
	.short	1                               # Flags
	.asciz	"argc"
	.p2align	2, 0x0
.Ltmp88:
	.cv_def_range	 .Ltmp8 .Ltmp9, frame_ptr_rel, 36
	.short	.Ltmp90-.Ltmp89                 # Record length
.Ltmp89:
	.short	4414                            # Record kind: S_LOCAL
	.long	4112                            # TypeIndex
	.short	1                               # Flags
	.asciz	"argv"
	.p2align	2, 0x0
.Ltmp90:
	.cv_def_range	 .Ltmp8 .Ltmp9, frame_ptr_rel, 40
	.short	2                               # Record length
	.short	4431                            # Record kind: S_PROC_ID_END
.Ltmp82:
	.p2align	2, 0x0
	.cv_linetable	4, main, .Lfunc_end4
	.section	.debug$S,"dr",associative,printf
	.p2align	2, 0x0
	.long	4                               # Debug section magic
	.long	241                             # Symbol subsection for printf
	.long	.Ltmp92-.Ltmp91                 # Subsection size
.Ltmp91:
	.short	.Ltmp94-.Ltmp93                 # Record length
.Ltmp93:
	.short	4423                            # Record kind: S_GPROC32_ID
	.long	0                               # PtrParent
	.long	0                               # PtrEnd
	.long	0                               # PtrNext
	.long	.Lfunc_end5-printf              # Code size
	.long	0                               # Offset after prologue
	.long	0                               # Offset before epilogue
	.long	4118                            # Function type index
	.secrel32	printf                  # Function section relative address
	.secidx	printf                          # Function section index
	.byte	0                               # Flags
	.asciz	"printf"                        # Function name
	.p2align	2, 0x0
.Ltmp94:
	.short	.Ltmp96-.Ltmp95                 # Record length
.Ltmp95:
	.short	4114                            # Record kind: S_FRAMEPROC
	.long	72                              # FrameSize
	.long	0                               # Padding
	.long	0                               # Offset of padding
	.long	0                               # Bytes of callee saved registers
	.long	0                               # Exception handler offset
	.short	0                               # Exception handler section
	.long	90112                           # Flags (defines frame register)
	.p2align	2, 0x0
.Ltmp96:
	.short	.Ltmp98-.Ltmp97                 # Record length
.Ltmp97:
	.short	4414                            # Record kind: S_LOCAL
	.long	4098                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_Format"
	.p2align	2, 0x0
.Ltmp98:
	.cv_def_range	 .Ltmp10 .Ltmp11, frame_ptr_rel, 64
	.short	.Ltmp100-.Ltmp99                # Record length
.Ltmp99:
	.short	4414                            # Record kind: S_LOCAL
	.long	116                             # TypeIndex
	.short	0                               # Flags
	.asciz	"_Result"
	.p2align	2, 0x0
.Ltmp100:
	.cv_def_range	 .Ltmp10 .Ltmp11, frame_ptr_rel, 60
	.short	.Ltmp102-.Ltmp101               # Record length
.Ltmp101:
	.short	4414                            # Record kind: S_LOCAL
	.long	1648                            # TypeIndex
	.short	0                               # Flags
	.asciz	"_ArgList"
	.p2align	2, 0x0
.Ltmp102:
	.cv_def_range	 .Ltmp10 .Ltmp11, frame_ptr_rel, 48
	.short	2                               # Record length
	.short	4431                            # Record kind: S_PROC_ID_END
.Ltmp92:
	.p2align	2, 0x0
	.cv_linetable	5, printf, .Lfunc_end5
	.section	.debug$S,"dr",associative,_vsprintf_l
	.p2align	2, 0x0
	.long	4                               # Debug section magic
	.long	241                             # Symbol subsection for _vsprintf_l
	.long	.Ltmp104-.Ltmp103               # Subsection size
.Ltmp103:
	.short	.Ltmp106-.Ltmp105               # Record length
.Ltmp105:
	.short	4423                            # Record kind: S_GPROC32_ID
	.long	0                               # PtrParent
	.long	0                               # PtrEnd
	.long	0                               # PtrNext
	.long	.Lfunc_end6-_vsprintf_l         # Code size
	.long	0                               # Offset after prologue
	.long	0                               # Offset before epilogue
	.long	4132                            # Function type index
	.secrel32	_vsprintf_l             # Function section relative address
	.secidx	_vsprintf_l                     # Function section index
	.byte	0                               # Flags
	.asciz	"_vsprintf_l"                   # Function name
	.p2align	2, 0x0
.Ltmp106:
	.short	.Ltmp108-.Ltmp107               # Record length
.Ltmp107:
	.short	4114                            # Record kind: S_FRAMEPROC
	.long	72                              # FrameSize
	.long	0                               # Padding
	.long	0                               # Offset of padding
	.long	0                               # Bytes of callee saved registers
	.long	0                               # Exception handler offset
	.short	0                               # Exception handler section
	.long	90112                           # Flags (defines frame register)
	.p2align	2, 0x0
.Ltmp108:
	.short	.Ltmp110-.Ltmp109               # Record length
.Ltmp109:
	.short	4414                            # Record kind: S_LOCAL
	.long	4096                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_Buffer"
	.p2align	2, 0x0
.Ltmp110:
	.cv_def_range	 .Ltmp12 .Ltmp13, frame_ptr_rel, 40
	.short	.Ltmp112-.Ltmp111               # Record length
.Ltmp111:
	.short	4414                            # Record kind: S_LOCAL
	.long	4098                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_Format"
	.p2align	2, 0x0
.Ltmp112:
	.cv_def_range	 .Ltmp12 .Ltmp13, frame_ptr_rel, 48
	.short	.Ltmp114-.Ltmp113               # Record length
.Ltmp113:
	.short	4414                            # Record kind: S_LOCAL
	.long	4121                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_Locale"
	.p2align	2, 0x0
.Ltmp114:
	.cv_def_range	 .Ltmp12 .Ltmp13, frame_ptr_rel, 56
	.short	.Ltmp116-.Ltmp115               # Record length
.Ltmp115:
	.short	4414                            # Record kind: S_LOCAL
	.long	1648                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_ArgList"
	.p2align	2, 0x0
.Ltmp116:
	.cv_def_range	 .Ltmp12 .Ltmp13, frame_ptr_rel, 64
	.short	2                               # Record length
	.short	4431                            # Record kind: S_PROC_ID_END
.Ltmp104:
	.p2align	2, 0x0
	.cv_linetable	6, _vsprintf_l, .Lfunc_end6
	.section	.debug$S,"dr",associative,_vsnprintf_l
	.p2align	2, 0x0
	.long	4                               # Debug section magic
	.long	241                             # Symbol subsection for _vsnprintf_l
	.long	.Ltmp118-.Ltmp117               # Subsection size
.Ltmp117:
	.short	.Ltmp120-.Ltmp119               # Record length
.Ltmp119:
	.short	4423                            # Record kind: S_GPROC32_ID
	.long	0                               # PtrParent
	.long	0                               # PtrEnd
	.long	0                               # PtrNext
	.long	.Lfunc_end7-_vsnprintf_l        # Code size
	.long	0                               # Offset after prologue
	.long	0                               # Offset before epilogue
	.long	4135                            # Function type index
	.secrel32	_vsnprintf_l            # Function section relative address
	.secidx	_vsnprintf_l                    # Function section index
	.byte	0                               # Flags
	.asciz	"_vsnprintf_l"                  # Function name
	.p2align	2, 0x0
.Ltmp120:
	.short	.Ltmp122-.Ltmp121               # Record length
.Ltmp121:
	.short	4114                            # Record kind: S_FRAMEPROC
	.long	136                             # FrameSize
	.long	0                               # Padding
	.long	0                               # Offset of padding
	.long	0                               # Bytes of callee saved registers
	.long	0                               # Exception handler offset
	.short	0                               # Exception handler section
	.long	90112                           # Flags (defines frame register)
	.p2align	2, 0x0
.Ltmp122:
	.short	.Ltmp124-.Ltmp123               # Record length
.Ltmp123:
	.short	4414                            # Record kind: S_LOCAL
	.long	4096                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_Buffer"
	.p2align	2, 0x0
.Ltmp124:
	.cv_def_range	 .Ltmp14 .Ltmp15, frame_ptr_rel, 104
	.short	.Ltmp126-.Ltmp125               # Record length
.Ltmp125:
	.short	4414                            # Record kind: S_LOCAL
	.long	4105                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_BufferCount"
	.p2align	2, 0x0
.Ltmp126:
	.cv_def_range	 .Ltmp14 .Ltmp15, frame_ptr_rel, 112
	.short	.Ltmp128-.Ltmp127               # Record length
.Ltmp127:
	.short	4414                            # Record kind: S_LOCAL
	.long	4098                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_Format"
	.p2align	2, 0x0
.Ltmp128:
	.cv_def_range	 .Ltmp14 .Ltmp15, frame_ptr_rel, 120
	.short	.Ltmp130-.Ltmp129               # Record length
.Ltmp129:
	.short	4414                            # Record kind: S_LOCAL
	.long	4121                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_Locale"
	.p2align	2, 0x0
.Ltmp130:
	.cv_def_range	 .Ltmp14 .Ltmp15, frame_ptr_rel, 128
	.short	.Ltmp132-.Ltmp131               # Record length
.Ltmp131:
	.short	4414                            # Record kind: S_LOCAL
	.long	1648                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_ArgList"
	.p2align	2, 0x0
.Ltmp132:
	.cv_def_range	 .Ltmp14 .Ltmp15, frame_ptr_rel, 176
	.short	.Ltmp134-.Ltmp133               # Record length
.Ltmp133:
	.short	4414                            # Record kind: S_LOCAL
	.long	4136                            # TypeIndex
	.short	0                               # Flags
	.asciz	"_Result"
	.p2align	2, 0x0
.Ltmp134:
	.cv_def_range	 .Ltmp14 .Ltmp15, frame_ptr_rel, 100
	.short	2                               # Record length
	.short	4431                            # Record kind: S_PROC_ID_END
.Ltmp118:
	.p2align	2, 0x0
	.cv_linetable	7, _vsnprintf_l, .Lfunc_end7
	.section	.debug$S,"dr",associative,__local_stdio_printf_options
	.p2align	2, 0x0
	.long	4                               # Debug section magic
	.long	241                             # Symbol subsection for __local_stdio_printf_options
	.long	.Ltmp136-.Ltmp135               # Subsection size
.Ltmp135:
	.short	.Ltmp138-.Ltmp137               # Record length
.Ltmp137:
	.short	4423                            # Record kind: S_GPROC32_ID
	.long	0                               # PtrParent
	.long	0                               # PtrEnd
	.long	0                               # PtrNext
	.long	.Lfunc_end8-__local_stdio_printf_options # Code size
	.long	0                               # Offset after prologue
	.long	0                               # Offset before epilogue
	.long	4139                            # Function type index
	.secrel32	__local_stdio_printf_options # Function section relative address
	.secidx	__local_stdio_printf_options    # Function section index
	.byte	0                               # Flags
	.asciz	"__local_stdio_printf_options"  # Function name
	.p2align	2, 0x0
.Ltmp138:
	.short	.Ltmp140-.Ltmp139               # Record length
.Ltmp139:
	.short	4114                            # Record kind: S_FRAMEPROC
	.long	0                               # FrameSize
	.long	0                               # Padding
	.long	0                               # Offset of padding
	.long	0                               # Bytes of callee saved registers
	.long	0                               # Exception handler offset
	.short	0                               # Exception handler section
	.long	8192                            # Flags (defines frame register)
	.p2align	2, 0x0
.Ltmp140:
	.short	.Ltmp142-.Ltmp141               # Record length
.Ltmp141:
	.short	4364                            # Record kind: S_LDATA32
	.long	35                              # Type
	.secrel32	__local_stdio_printf_options._OptionsStorage # DataOffset
	.secidx	__local_stdio_printf_options._OptionsStorage # Segment
	.asciz	"_OptionsStorage"               # Name
	.p2align	2, 0x0
.Ltmp142:
	.short	2                               # Record length
	.short	4431                            # Record kind: S_PROC_ID_END
.Ltmp136:
	.p2align	2, 0x0
	.cv_linetable	8, __local_stdio_printf_options, .Lfunc_end8
	.section	.debug$S,"dr",associative,_vfprintf_l
	.p2align	2, 0x0
	.long	4                               # Debug section magic
	.long	241                             # Symbol subsection for _vfprintf_l
	.long	.Ltmp144-.Ltmp143               # Subsection size
.Ltmp143:
	.short	.Ltmp146-.Ltmp145               # Record length
.Ltmp145:
	.short	4423                            # Record kind: S_GPROC32_ID
	.long	0                               # PtrParent
	.long	0                               # PtrEnd
	.long	0                               # PtrNext
	.long	.Lfunc_end9-_vfprintf_l         # Code size
	.long	0                               # Offset after prologue
	.long	0                               # Offset before epilogue
	.long	4148                            # Function type index
	.secrel32	_vfprintf_l             # Function section relative address
	.secidx	_vfprintf_l                     # Function section index
	.byte	0                               # Flags
	.asciz	"_vfprintf_l"                   # Function name
	.p2align	2, 0x0
.Ltmp146:
	.short	.Ltmp148-.Ltmp147               # Record length
.Ltmp147:
	.short	4114                            # Record kind: S_FRAMEPROC
	.long	104                             # FrameSize
	.long	0                               # Padding
	.long	0                               # Offset of padding
	.long	0                               # Bytes of callee saved registers
	.long	0                               # Exception handler offset
	.short	0                               # Exception handler section
	.long	90112                           # Flags (defines frame register)
	.p2align	2, 0x0
.Ltmp148:
	.short	.Ltmp150-.Ltmp149               # Record length
.Ltmp149:
	.short	4414                            # Record kind: S_LOCAL
	.long	4141                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_Stream"
	.p2align	2, 0x0
.Ltmp150:
	.cv_def_range	 .Ltmp17 .Ltmp18, frame_ptr_rel, 72
	.short	.Ltmp152-.Ltmp151               # Record length
.Ltmp151:
	.short	4414                            # Record kind: S_LOCAL
	.long	4098                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_Format"
	.p2align	2, 0x0
.Ltmp152:
	.cv_def_range	 .Ltmp17 .Ltmp18, frame_ptr_rel, 80
	.short	.Ltmp154-.Ltmp153               # Record length
.Ltmp153:
	.short	4414                            # Record kind: S_LOCAL
	.long	4121                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_Locale"
	.p2align	2, 0x0
.Ltmp154:
	.cv_def_range	 .Ltmp17 .Ltmp18, frame_ptr_rel, 88
	.short	.Ltmp156-.Ltmp155               # Record length
.Ltmp155:
	.short	4414                            # Record kind: S_LOCAL
	.long	1648                            # TypeIndex
	.short	1                               # Flags
	.asciz	"_ArgList"
	.p2align	2, 0x0
.Ltmp156:
	.cv_def_range	 .Ltmp17 .Ltmp18, frame_ptr_rel, 96
	.short	2                               # Record length
	.short	4431                            # Record kind: S_PROC_ID_END
.Ltmp144:
	.p2align	2, 0x0
	.cv_linetable	9, _vfprintf_l, .Lfunc_end9
	.section	.debug$S,"dr"
	.long	241
	.long	.Ltmp158-.Ltmp157               # Subsection size
.Ltmp157:
	.short	.Ltmp160-.Ltmp159               # Record length
.Ltmp159:
	.short	4360                            # Record kind: S_UDT
	.long	1648                            # Type
	.asciz	"va_list"
	.p2align	2, 0x0
.Ltmp160:
	.short	.Ltmp162-.Ltmp161               # Record length
.Ltmp161:
	.short	4360                            # Record kind: S_UDT
	.long	35                              # Type
	.asciz	"size_t"
	.p2align	2, 0x0
.Ltmp162:
	.short	.Ltmp164-.Ltmp163               # Record length
.Ltmp163:
	.short	4360                            # Record kind: S_UDT
	.long	4129                            # Type
	.asciz	"__crt_locale_pointers"
	.p2align	2, 0x0
.Ltmp164:
	.short	.Ltmp166-.Ltmp165               # Record length
.Ltmp165:
	.short	4360                            # Record kind: S_UDT
	.long	4120                            # Type
	.asciz	"_locale_t"
	.p2align	2, 0x0
.Ltmp166:
	.short	.Ltmp168-.Ltmp167               # Record length
.Ltmp167:
	.short	4360                            # Record kind: S_UDT
	.long	4129                            # Type
	.asciz	"__crt_locale_pointers"
	.p2align	2, 0x0
.Ltmp168:
	.short	.Ltmp170-.Ltmp169               # Record length
.Ltmp169:
	.short	4360                            # Record kind: S_UDT
	.long	4145                            # Type
	.asciz	"FILE"
	.p2align	2, 0x0
.Ltmp170:
	.short	.Ltmp172-.Ltmp171               # Record length
.Ltmp171:
	.short	4360                            # Record kind: S_UDT
	.long	4145                            # Type
	.asciz	"_iobuf"
	.p2align	2, 0x0
.Ltmp172:
.Ltmp158:
	.p2align	2, 0x0
	.cv_filechecksums                       # File index to string table offset subsection
	.cv_stringtable                         # String table
	.long	241
	.long	.Ltmp174-.Ltmp173               # Subsection size
.Ltmp173:
	.short	.Ltmp176-.Ltmp175               # Record length
.Ltmp175:
	.short	4428                            # Record kind: S_BUILDINFO
	.long	4154                            # LF_BUILDINFO index
	.p2align	2, 0x0
.Ltmp176:
.Ltmp174:
	.p2align	2, 0x0
	.section	.debug$T,"dr"
	.p2align	2, 0x0
	.long	4                               # Debug section magic
	# Pointer (0x1000)
	.short	0xa                             # Record length
	.short	0x1002                          # Record kind: LF_POINTER
	.long	0x70                            # PointeeType: char
	.long	0x1040c                         # Attrs: [ Type: Near64, Mode: Pointer, SizeOf: 8, isConst ]
	# Modifier (0x1001)
	.short	0xa                             # Record length
	.short	0x1001                          # Record kind: LF_MODIFIER
	.long	0x70                            # ModifiedType: char
	.short	0x1                             # Modifiers ( Const (0x1) )
	.byte	242
	.byte	241
	# Pointer (0x1002)
	.short	0xa                             # Record length
	.short	0x1002                          # Record kind: LF_POINTER
	.long	0x1001                          # PointeeType: const char
	.long	0x1040c                         # Attrs: [ Type: Near64, Mode: Pointer, SizeOf: 8, isConst ]
	# ArgList (0x1003)
	.short	0x12                            # Record length
	.short	0x1201                          # Record kind: LF_ARGLIST
	.long	0x3                             # NumArgs
	.long	0x1000                          # Argument: char* const
	.long	0x1002                          # Argument: const char* const
	.long	0x0                             # Argument
	# Procedure (0x1004)
	.short	0xe                             # Record length
	.short	0x1008                          # Record kind: LF_PROCEDURE
	.long	0x74                            # ReturnType: int
	.byte	0x0                             # CallingConvention: NearC
	.byte	0x0                             # FunctionOptions
	.short	0x3                             # NumParameters
	.long	0x1003                          # ArgListType: (char* const, const char* const, <no type>)
	# FuncId (0x1005)
	.short	0x12                            # Record length
	.short	0x1601                          # Record kind: LF_FUNC_ID
	.long	0x0                             # ParentScope
	.long	0x1004                          # FunctionType: int (char* const, const char* const, <no type>)
	.asciz	"sprintf"                       # Name
	# ArgList (0x1006)
	.short	0x12                            # Record length
	.short	0x1201                          # Record kind: LF_ARGLIST
	.long	0x3                             # NumArgs
	.long	0x1000                          # Argument: char* const
	.long	0x1002                          # Argument: const char* const
	.long	0x670                           # Argument: char*
	# Procedure (0x1007)
	.short	0xe                             # Record length
	.short	0x1008                          # Record kind: LF_PROCEDURE
	.long	0x74                            # ReturnType: int
	.byte	0x0                             # CallingConvention: NearC
	.byte	0x0                             # FunctionOptions
	.short	0x3                             # NumParameters
	.long	0x1006                          # ArgListType: (char* const, const char* const, char*)
	# FuncId (0x1008)
	.short	0x16                            # Record length
	.short	0x1601                          # Record kind: LF_FUNC_ID
	.long	0x0                             # ParentScope
	.long	0x1007                          # FunctionType: int (char* const, const char* const, char*)
	.asciz	"vsprintf"                      # Name
	.byte	243
	.byte	242
	.byte	241
	# Modifier (0x1009)
	.short	0xa                             # Record length
	.short	0x1001                          # Record kind: LF_MODIFIER
	.long	0x23                            # ModifiedType: unsigned __int64
	.short	0x1                             # Modifiers ( Const (0x1) )
	.byte	242
	.byte	241
	# ArgList (0x100A)
	.short	0x16                            # Record length
	.short	0x1201                          # Record kind: LF_ARGLIST
	.long	0x4                             # NumArgs
	.long	0x1000                          # Argument: char* const
	.long	0x1009                          # Argument: const unsigned __int64
	.long	0x1002                          # Argument: const char* const
	.long	0x0                             # Argument
	# Procedure (0x100B)
	.short	0xe                             # Record length
	.short	0x1008                          # Record kind: LF_PROCEDURE
	.long	0x74                            # ReturnType: int
	.byte	0x0                             # CallingConvention: NearC
	.byte	0x0                             # FunctionOptions
	.short	0x4                             # NumParameters
	.long	0x100a                          # ArgListType: (char* const, const unsigned __int64, const char* const, <no type>)
	# FuncId (0x100C)
	.short	0x16                            # Record length
	.short	0x1601                          # Record kind: LF_FUNC_ID
	.long	0x0                             # ParentScope
	.long	0x100b                          # FunctionType: int (char* const, const unsigned __int64, const char* const, <no type>)
	.asciz	"_snprintf"                     # Name
	.byte	242
	.byte	241
	# ArgList (0x100D)
	.short	0x16                            # Record length
	.short	0x1201                          # Record kind: LF_ARGLIST
	.long	0x4                             # NumArgs
	.long	0x1000                          # Argument: char* const
	.long	0x1009                          # Argument: const unsigned __int64
	.long	0x1002                          # Argument: const char* const
	.long	0x670                           # Argument: char*
	# Procedure (0x100E)
	.short	0xe                             # Record length
	.short	0x1008                          # Record kind: LF_PROCEDURE
	.long	0x74                            # ReturnType: int
	.byte	0x0                             # CallingConvention: NearC
	.byte	0x0                             # FunctionOptions
	.short	0x4                             # NumParameters
	.long	0x100d                          # ArgListType: (char* const, const unsigned __int64, const char* const, char*)
	# FuncId (0x100F)
	.short	0x16                            # Record length
	.short	0x1601                          # Record kind: LF_FUNC_ID
	.long	0x0                             # ParentScope
	.long	0x100e                          # FunctionType: int (char* const, const unsigned __int64, const char* const, char*)
	.asciz	"_vsnprintf"                    # Name
	.byte	241
	# Pointer (0x1010)
	.short	0xa                             # Record length
	.short	0x1002                          # Record kind: LF_POINTER
	.long	0x670                           # PointeeType: char*
	.long	0x1000c                         # Attrs: [ Type: Near64, Mode: Pointer, SizeOf: 8 ]
	# ArgList (0x1011)
	.short	0xe                             # Record length
	.short	0x1201                          # Record kind: LF_ARGLIST
	.long	0x2                             # NumArgs
	.long	0x74                            # Argument: int
	.long	0x1010                          # Argument: char**
	# Procedure (0x1012)
	.short	0xe                             # Record length
	.short	0x1008                          # Record kind: LF_PROCEDURE
	.long	0x74                            # ReturnType: int
	.byte	0x0                             # CallingConvention: NearC
	.byte	0x0                             # FunctionOptions
	.short	0x2                             # NumParameters
	.long	0x1011                          # ArgListType: (int, char**)
	# FuncId (0x1013)
	.short	0x12                            # Record length
	.short	0x1601                          # Record kind: LF_FUNC_ID
	.long	0x0                             # ParentScope
	.long	0x1012                          # FunctionType: int (int, char**)
	.asciz	"main"                          # Name
	.byte	243
	.byte	242
	.byte	241
	# ArgList (0x1014)
	.short	0xe                             # Record length
	.short	0x1201                          # Record kind: LF_ARGLIST
	.long	0x2                             # NumArgs
	.long	0x1002                          # Argument: const char* const
	.long	0x0                             # Argument
	# Procedure (0x1015)
	.short	0xe                             # Record length
	.short	0x1008                          # Record kind: LF_PROCEDURE
	.long	0x74                            # ReturnType: int
	.byte	0x0                             # CallingConvention: NearC
	.byte	0x0                             # FunctionOptions
	.short	0x2                             # NumParameters
	.long	0x1014                          # ArgListType: (const char* const, <no type>)
	# FuncId (0x1016)
	.short	0x12                            # Record length
	.short	0x1601                          # Record kind: LF_FUNC_ID
	.long	0x0                             # ParentScope
	.long	0x1015                          # FunctionType: int (const char* const, <no type>)
	.asciz	"printf"                        # Name
	.byte	241
	# Struct (0x1017)
	.short	0x2a                            # Record length
	.short	0x1505                          # Record kind: LF_STRUCTURE
	.short	0x0                             # MemberCount
	.short	0x80                            # Properties ( ForwardReference (0x80) )
	.long	0x0                             # FieldList
	.long	0x0                             # DerivedFrom
	.long	0x0                             # VShape
	.short	0x0                             # SizeOf
	.asciz	"__crt_locale_pointers"         # Name
	# Pointer (0x1018)
	.short	0xa                             # Record length
	.short	0x1002                          # Record kind: LF_POINTER
	.long	0x1017                          # PointeeType: __crt_locale_pointers
	.long	0x1000c                         # Attrs: [ Type: Near64, Mode: Pointer, SizeOf: 8 ]
	# Modifier (0x1019)
	.short	0xa                             # Record length
	.short	0x1001                          # Record kind: LF_MODIFIER
	.long	0x1018                          # ModifiedType: __crt_locale_pointers*
	.short	0x1                             # Modifiers ( Const (0x1) )
	.byte	242
	.byte	241
	# ArgList (0x101A)
	.short	0x16                            # Record length
	.short	0x1201                          # Record kind: LF_ARGLIST
	.long	0x4                             # NumArgs
	.long	0x1000                          # Argument: char* const
	.long	0x1002                          # Argument: const char* const
	.long	0x1019                          # Argument: const __crt_locale_pointers*
	.long	0x670                           # Argument: char*
	# Procedure (0x101B)
	.short	0xe                             # Record length
	.short	0x1008                          # Record kind: LF_PROCEDURE
	.long	0x74                            # ReturnType: int
	.byte	0x0                             # CallingConvention: NearC
	.byte	0x0                             # FunctionOptions
	.short	0x4                             # NumParameters
	.long	0x101a                          # ArgListType: (char* const, const char* const, const __crt_locale_pointers*, char*)
	# Struct (0x101C)
	.short	0x26                            # Record length
	.short	0x1505                          # Record kind: LF_STRUCTURE
	.short	0x0                             # MemberCount
	.short	0x80                            # Properties ( ForwardReference (0x80) )
	.long	0x0                             # FieldList
	.long	0x0                             # DerivedFrom
	.long	0x0                             # VShape
	.short	0x0                             # SizeOf
	.asciz	"__crt_locale_data"             # Name
	# Pointer (0x101D)
	.short	0xa                             # Record length
	.short	0x1002                          # Record kind: LF_POINTER
	.long	0x101c                          # PointeeType: __crt_locale_data
	.long	0x1000c                         # Attrs: [ Type: Near64, Mode: Pointer, SizeOf: 8 ]
	# Struct (0x101E)
	.short	0x2a                            # Record length
	.short	0x1505                          # Record kind: LF_STRUCTURE
	.short	0x0                             # MemberCount
	.short	0x80                            # Properties ( ForwardReference (0x80) )
	.long	0x0                             # FieldList
	.long	0x0                             # DerivedFrom
	.long	0x0                             # VShape
	.short	0x0                             # SizeOf
	.asciz	"__crt_multibyte_data"          # Name
	.byte	241
	# Pointer (0x101F)
	.short	0xa                             # Record length
	.short	0x1002                          # Record kind: LF_POINTER
	.long	0x101e                          # PointeeType: __crt_multibyte_data
	.long	0x1000c                         # Attrs: [ Type: Near64, Mode: Pointer, SizeOf: 8 ]
	# FieldList (0x1020)
	.short	0x2a                            # Record length
	.short	0x1203                          # Record kind: LF_FIELDLIST
	.short	0x150d                          # Member kind: DataMember ( LF_MEMBER )
	.short	0x3                             # Attrs: Public
	.long	0x101d                          # Type: __crt_locale_data*
	.short	0x0                             # FieldOffset
	.asciz	"locinfo"                       # Name
	.byte	242
	.byte	241
	.short	0x150d                          # Member kind: DataMember ( LF_MEMBER )
	.short	0x3                             # Attrs: Public
	.long	0x101f                          # Type: __crt_multibyte_data*
	.short	0x8                             # FieldOffset
	.asciz	"mbcinfo"                       # Name
	.byte	242
	.byte	241
	# Struct (0x1021)
	.short	0x2a                            # Record length
	.short	0x1505                          # Record kind: LF_STRUCTURE
	.short	0x2                             # MemberCount
	.short	0x0                             # Properties
	.long	0x1020                          # FieldList: <field list>
	.long	0x0                             # DerivedFrom
	.long	0x0                             # VShape
	.short	0x10                            # SizeOf
	.asciz	"__crt_locale_pointers"         # Name
	# StringId (0x1022)
	.short	0x52                            # Record length
	.short	0x1605                          # Record kind: LF_STRING_ID
	.long	0x0                             # Id
	.asciz	"C:\\Program Files (x86)\\Windows Kits\\10\\Include\\10.0.22621.0\\ucrt\\corecrt.h" # StringData
	.byte	241
	# UdtSourceLine (0x1023)
	.short	0xe                             # Record length
	.short	0x1606                          # Record kind: LF_UDT_SRC_LINE
	.long	0x1021                          # UDT: __crt_locale_pointers
	.long	0x1022                          # SourceFile: C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\corecrt.h
	.long	0x269                           # LineNumber
	# FuncId (0x1024)
	.short	0x16                            # Record length
	.short	0x1601                          # Record kind: LF_FUNC_ID
	.long	0x0                             # ParentScope
	.long	0x101b                          # FunctionType: int (char* const, const char* const, const __crt_locale_pointers*, char*)
	.asciz	"_vsprintf_l"                   # Name
	# ArgList (0x1025)
	.short	0x1a                            # Record length
	.short	0x1201                          # Record kind: LF_ARGLIST
	.long	0x5                             # NumArgs
	.long	0x1000                          # Argument: char* const
	.long	0x1009                          # Argument: const unsigned __int64
	.long	0x1002                          # Argument: const char* const
	.long	0x1019                          # Argument: const __crt_locale_pointers*
	.long	0x670                           # Argument: char*
	# Procedure (0x1026)
	.short	0xe                             # Record length
	.short	0x1008                          # Record kind: LF_PROCEDURE
	.long	0x74                            # ReturnType: int
	.byte	0x0                             # CallingConvention: NearC
	.byte	0x0                             # FunctionOptions
	.short	0x5                             # NumParameters
	.long	0x1025                          # ArgListType: (char* const, const unsigned __int64, const char* const, const __crt_locale_pointers*, char*)
	# FuncId (0x1027)
	.short	0x1a                            # Record length
	.short	0x1601                          # Record kind: LF_FUNC_ID
	.long	0x0                             # ParentScope
	.long	0x1026                          # FunctionType: int (char* const, const unsigned __int64, const char* const, const __crt_locale_pointers*, char*)
	.asciz	"_vsnprintf_l"                  # Name
	.byte	243
	.byte	242
	.byte	241
	# Modifier (0x1028)
	.short	0xa                             # Record length
	.short	0x1001                          # Record kind: LF_MODIFIER
	.long	0x74                            # ModifiedType: int
	.short	0x1                             # Modifiers ( Const (0x1) )
	.byte	242
	.byte	241
	# ArgList (0x1029)
	.short	0x6                             # Record length
	.short	0x1201                          # Record kind: LF_ARGLIST
	.long	0x0                             # NumArgs
	# Procedure (0x102A)
	.short	0xe                             # Record length
	.short	0x1008                          # Record kind: LF_PROCEDURE
	.long	0x623                           # ReturnType: unsigned __int64*
	.byte	0x0                             # CallingConvention: NearC
	.byte	0x0                             # FunctionOptions
	.short	0x0                             # NumParameters
	.long	0x1029                          # ArgListType: ()
	# FuncId (0x102B)
	.short	0x2a                            # Record length
	.short	0x1601                          # Record kind: LF_FUNC_ID
	.long	0x0                             # ParentScope
	.long	0x102a                          # FunctionType: unsigned __int64* ()
	.asciz	"__local_stdio_printf_options"  # Name
	.byte	243
	.byte	242
	.byte	241
	# Struct (0x102C)
	.short	0x1e                            # Record length
	.short	0x1505                          # Record kind: LF_STRUCTURE
	.short	0x0                             # MemberCount
	.short	0x80                            # Properties ( ForwardReference (0x80) )
	.long	0x0                             # FieldList
	.long	0x0                             # DerivedFrom
	.long	0x0                             # VShape
	.short	0x0                             # SizeOf
	.asciz	"_iobuf"                        # Name
	.byte	243
	.byte	242
	.byte	241
	# Pointer (0x102D)
	.short	0xa                             # Record length
	.short	0x1002                          # Record kind: LF_POINTER
	.long	0x102c                          # PointeeType: _iobuf
	.long	0x1040c                         # Attrs: [ Type: Near64, Mode: Pointer, SizeOf: 8, isConst ]
	# ArgList (0x102E)
	.short	0x16                            # Record length
	.short	0x1201                          # Record kind: LF_ARGLIST
	.long	0x4                             # NumArgs
	.long	0x102d                          # Argument: _iobuf* const
	.long	0x1002                          # Argument: const char* const
	.long	0x1019                          # Argument: const __crt_locale_pointers*
	.long	0x670                           # Argument: char*
	# Procedure (0x102F)
	.short	0xe                             # Record length
	.short	0x1008                          # Record kind: LF_PROCEDURE
	.long	0x74                            # ReturnType: int
	.byte	0x0                             # CallingConvention: NearC
	.byte	0x0                             # FunctionOptions
	.short	0x4                             # NumParameters
	.long	0x102e                          # ArgListType: (_iobuf* const, const char* const, const __crt_locale_pointers*, char*)
	# FieldList (0x1030)
	.short	0x1a                            # Record length
	.short	0x1203                          # Record kind: LF_FIELDLIST
	.short	0x150d                          # Member kind: DataMember ( LF_MEMBER )
	.short	0x3                             # Attrs: Public
	.long	0x603                           # Type: void*
	.short	0x0                             # FieldOffset
	.asciz	"_Placeholder"                  # Name
	.byte	241
	# Struct (0x1031)
	.short	0x1e                            # Record length
	.short	0x1505                          # Record kind: LF_STRUCTURE
	.short	0x1                             # MemberCount
	.short	0x0                             # Properties
	.long	0x1030                          # FieldList: <field list>
	.long	0x0                             # DerivedFrom
	.long	0x0                             # VShape
	.short	0x8                             # SizeOf
	.asciz	"_iobuf"                        # Name
	.byte	243
	.byte	242
	.byte	241
	# StringId (0x1032)
	.short	0x5a                            # Record length
	.short	0x1605                          # Record kind: LF_STRING_ID
	.long	0x0                             # Id
	.asciz	"C:\\Program Files (x86)\\Windows Kits\\10\\Include\\10.0.22621.0\\ucrt\\corecrt_wstdio.h" # StringData
	.byte	242
	.byte	241
	# UdtSourceLine (0x1033)
	.short	0xe                             # Record length
	.short	0x1606                          # Record kind: LF_UDT_SRC_LINE
	.long	0x1031                          # UDT: _iobuf
	.long	0x1032                          # SourceFile: C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt\corecrt_wstdio.h
	.long	0x1c                            # LineNumber
	# FuncId (0x1034)
	.short	0x16                            # Record length
	.short	0x1601                          # Record kind: LF_FUNC_ID
	.long	0x0                             # ParentScope
	.long	0x102f                          # FunctionType: int (_iobuf* const, const char* const, const __crt_locale_pointers*, char*)
	.asciz	"_vfprintf_l"                   # Name
	# StringId (0x1035)
	.short	0x2a                            # Record length
	.short	0x1605                          # Record kind: LF_STRING_ID
	.long	0x0                             # Id
	.asciz	"h:\\Workspace\\vscode-llvm\\example" # StringData
	.byte	243
	.byte	242
	.byte	241
	# StringId (0x1036)
	.short	0x12                            # Record length
	.short	0x1605                          # Record kind: LF_STRING_ID
	.long	0x0                             # Id
	.asciz	"test\\main.c"                  # StringData
	# StringId (0x1037)
	.short	0xa                             # Record length
	.short	0x1605                          # Record kind: LF_STRING_ID
	.long	0x0                             # Id
	.byte	0                               # StringData
	.byte	243
	.byte	242
	.byte	241
	# StringId (0x1038)
	.short	0x2a                            # Record length
	.short	0x1605                          # Record kind: LF_STRING_ID
	.long	0x0                             # Id
	.asciz	"C:\\Program Files\\LLVM\\bin\\clang.exe" # StringData
	# StringId (0x1039)
	.short	0x3de                           # Record length
	.short	0x1605                          # Record kind: LF_STRING_ID
	.long	0x0                             # Id
	.asciz	"\"-cc1\" \"-triple\" \"x86_64-pc-windows-msvc19.38.33133\" \"-S\" \"-save-temps=obj\" \"-disable-free\" \"-clear-ast-before-backend\" \"-disable-llvm-verifier\" \"-discard-value-names\" \"-mrelocation-model\" \"pic\" \"-pic-level\" \"2\" \"-mframe-pointer=none\" \"-fmath-errno\" \"-ffp-contract=on\" \"-fno-rounding-math\" \"-mconstructor-aliases\" \"-funwind-tables=2\" \"-target-cpu\" \"x86-64\" \"-tune-cpu\" \"generic\" \"-mllvm\" \"-treat-scalable-fixed-error-as-warning\" \"-gno-column-info\" \"-gcodeview\" \"-debug-info-kind=constructor\" \"-fcoverage-compilation-dir=h:\\\\Workspace\\\\vscode-llvm\\\\example\" \"-resource-dir\" \"C:\\\\Program Files\\\\LLVM\\\\lib\\\\clang\\\\16\" \"-O0\" \"-fdebug-compilation-dir=h:\\\\Workspace\\\\vscode-llvm\\\\example\" \"-ferror-limit\" \"19\" \"-fno-use-cxa-atexit\" \"-fms-extensions\" \"-fms-compatibility\" \"-fms-compatibility-version=19.38.33133\" \"-fdelayed-template-parsing\" \"-disable-O0-optnone\" \"-mllvm\" \"-print-module-scope\" \"-mllvm\" \"-print-before-all\" \"-mllvm\" \"-print-after-all\" \"-faddrsig\" \"-x\" \"ir\" \"test\\\\main.bc\"" # StringData
	.byte	241
	# BuildInfo (0x103A)
	.short	0x1a                            # Record length
	.short	0x1603                          # Record kind: LF_BUILDINFO
	.short	0x5                             # NumArgs
	.long	0x1035                          # Argument: h:\Workspace\vscode-llvm\example
	.long	0x1038                          # Argument: C:\Program Files\LLVM\bin\clang.exe
	.long	0x1036                          # Argument: test\main.c
	.long	0x1037                          # Argument
	.long	0x1039                          # Argument: "-cc1" "-triple" "x86_64-pc-windows-msvc19.38.33133" "-S" "-save-temps=obj" "-disable-free" "-clear-ast-before-backend" "-disable-llvm-verifier" "-discard-value-names" "-mrelocation-model" "pic" "-pic-level" "2" "-mframe-pointer=none" "-fmath-errno" "-ffp-contract=on" "-fno-rounding-math" "-mconstructor-aliases" "-funwind-tables=2" "-target-cpu" "x86-64" "-tune-cpu" "generic" "-mllvm" "-treat-scalable-fixed-error-as-warning" "-gno-column-info" "-gcodeview" "-debug-info-kind=constructor" "-fcoverage-compilation-dir=h:\\Workspace\\vscode-llvm\\example" "-resource-dir" "C:\\Program Files\\LLVM\\lib\\clang\\16" "-O0" "-fdebug-compilation-dir=h:\\Workspace\\vscode-llvm\\example" "-ferror-limit" "19" "-fno-use-cxa-atexit" "-fms-extensions" "-fms-compatibility" "-fms-compatibility-version=19.38.33133" "-fdelayed-template-parsing" "-disable-O0-optnone" "-mllvm" "-print-module-scope" "-mllvm" "-print-before-all" "-mllvm" "-print-after-all" "-faddrsig" "-x" "ir" "test\\main.bc"
	.byte	242
	.byte	241
	.addrsig
	.addrsig_sym _vsnprintf
	.addrsig_sym printf
	.addrsig_sym _vsprintf_l
	.addrsig_sym _vsnprintf_l
	.addrsig_sym __stdio_common_vsprintf
	.addrsig_sym __local_stdio_printf_options
	.addrsig_sym _vfprintf_l
	.addrsig_sym __acrt_iob_func
	.addrsig_sym __stdio_common_vfprintf
	.addrsig_sym __local_stdio_printf_options._OptionsStorage
