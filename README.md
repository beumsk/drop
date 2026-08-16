# DROP

## TODO

- MOBILE gameplay!
- add sound design
- better design: colors, responsiveness
- better visuals
- make it endlessly important to catch entities
  - bonus points?
  - infinite grow?
- move some entities horizontally?

## Logic

- points system based on frame (time)
  - multiplicator goes up (water) or down (earth)
- entities effects
  - fire => evaporate: gameover
  - water => coalescence: grow (+mult)
  - earth => absorption: shrink (-mult)
  - air => tailwind: speed up scroll
  - snow => freeze: slow down movements left-right
  - sun => drought: shrink water hitbox
  - oil => slip: invert left-right
