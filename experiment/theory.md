## What Is a Graph?

Before we talk about planar graphs, let’s remember what a graph is.

A **graph** is made up of **dots** (called **vertices**) and **lines** (called **edges**) that connect those dots. We use graphs to represent many things — cities connected by roads, computers linked by cables, or even friendships between people!

---

## What Makes a Graph Planar?

A **planar graph** is a special kind of graph. It can be **drawn on a flat surface** — like a page or a screen — so that **none of the edges cross each other** (except where they meet at a point).

If you can draw the graph this way, it is **planar**. If you **cannot draw it without lines crossing**, no matter how you try, then the graph is **non-planar**.

---

## Examples of Planar and Non-Planar Graphs

Let’s look at some graphs that you may see in puzzles or math class. Are they planar or not?

| Graph Name | Description                                     | Planar? | Notes                                                           |
| ---------- | ----------------------------------------------- | ------- | --------------------------------------------------------------- |
| `K1`       | A single point                                  | ✅ Yes   | Just one vertex. Nothing to cross.                              |
| `K2`       | Two dots connected by a line                    | ✅ Yes   | Simple line. No crossing.                                       |
| `K3`       | Triangle                                        | ✅ Yes   | All three dots connected, forming a triangle.                   |
| `K4`       | Complete graph with 4 vertices                  | ✅ Yes   | Can be drawn like a triangle with one vertex in the middle.     |
| `K5`       | 5 dots, each connected to all others            | ❌ No    | Cannot be drawn without crossings — too many connections!       |
| `K3,3`     | 6 nodes in two groups of 3, all cross-connected | ❌ No    | Also cannot be drawn planar — this is part of a famous theorem. |
| Star       | One center point connected to others            | ✅ Yes   | No crossing needed — like a starburst!                          |
| Cube Graph | Like a 3D box flattened on paper                | ✅ Yes   | It looks tricky, but it can be drawn without any edge crossing. |

---

## How Do We Know a Graph Isn’t Planar?

Some graphs *look* like they could be drawn neatly, but they just **can’t be untangled**. How do we know?

That’s where **Kuratowski’s Theorem** comes in.

### Kuratowski’s Theorem (Simplified)

> A graph is **non-planar** if it **contains a twisted or stretched version** of either:
>
> * `K5` (5 dots all connected to each other), or
> * `K3,3` (2 sets of 3 dots, with each dot from one set connected to all in the other).

If you can find either of these inside your graph (even if the lines are bent or extra points are added on edges), then your graph is non-planar.

---

## Euler’s Magic Formula (For Planar Graphs)

Here’s a formula that works for **any connected planar graph**:

$$
V - E + F = 2
$$

Where:

* $V$ = number of vertices (dots)
* $E$ = number of edges (lines)
* $F$ = number of faces (regions, including the outer area)

Try drawing a triangle (3 vertices, 3 edges, 1 face inside + 1 outer = 2 faces):

$$
3 - 3 + 2 = 2 \quad 
$$

Euler’s formula helps us **double-check** if a graph might be planar.

---

## Try It Yourself!

Let’s say you’re given a graph with:

* 6 vertices
* 10 edges

Is it planar?

👉 Try to draw it on paper.
👉 Count how many faces you create.
👉 Use Euler’s formula: $V - E + F = 2$.
👉 If it doesn’t work out, it might not be planar!

---

## Why Is This Useful?

### Real-Life Applications of Planarity

* 🗺️ **Map Drawing**: Subway and metro maps are redrawn as planar graphs to make them easier to read — they don’t show real distances, just clean layouts.
* 🧠 **Puzzle Solving**: Many games and puzzles ask if you can draw graphs without crossing lines.
* 💻 **Circuit Design**: In computer chips (VLSI), circuits must avoid wire crossings to avoid short-circuits.
