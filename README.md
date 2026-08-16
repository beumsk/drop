# DROP

## TODO

- turn into TS
- MOBILE gameplay!
- add sound design
- better design: colors, responsiveness
- better visuals: entities, bg, favicon
- sequence (like tetris) to avoid having 20 entities without a single water or fire or earth

## Ideas

- move some entities horizontally?
- could fire be beaten if your drop is bigger ? => no, too easy to grow biggest

## Logic

- points system based on frame (time)
  - multiplicator goes up (water) or down (earth)
- entities effects
  - fire => evaporate: gameover
  - water => coalescence: grow (+mult)
  - gem => enrich: points
  - earth => absorption: shrink (-mult)
  - air => tailwind: speed up scroll
  - snow => freeze: slow down movements left-right
  - sun => drought: shrink water hitbox
  - oil => slip: invert left-right
