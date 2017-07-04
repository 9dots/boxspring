import sys
B = []
for i in range(0,63):
    for j in range(0,65):
        B.append((((((i * 65) + j)*8)/64)%32))

print "right column of B"
print [x for i,x in enumerate(B) if i % 65 == 64]

A = []
for i in range(0,65):
    A.append([])
    for j in range(0,63):
        A[i].append((((((i * 63) + j)*8)/64)%32))

print "bottom row of A"
for j in range(0,63):
    sys.stdout.write("%d " % A[64][j])


"""
sys.stdout.flush()

print "B"
for i in range(0,63):
    for j in range(0,65):
        sys.stdout.write("%d " % (((((i * 65) + j)*8)/64)%32))
    sys.stdout.write("\n")

sys.stdout.flush()
"""

