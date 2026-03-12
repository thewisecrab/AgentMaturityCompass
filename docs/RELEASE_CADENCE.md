# AMC Release Cadence

This document explains the intended release rhythm for AMC so upgrades feel predictable rather than chaotic.

## Goals

A good release cadence should give users:
- confidence that the project is alive
- enough stability to adopt it in real workflows
- clear expectations for fixes vs features vs breaking changes

## Target cadence

### Patch releases
- as needed for important bug fixes, doc corrections, packaging issues, and release follow-ups

### Minor releases
- roughly monthly when enough meaningful improvements have accumulated
- typical contents:
  - new commands
  - new packs/modules
  - new adapters/integrations
  - docs and example improvements

### Major releases
- only when there are true breaking changes
- should include migration notes and explicit upgrade guidance

## What should trigger a release

Examples:
- meaningful new user-facing commands or workflows
- packaging/install improvements
- compatibility expansions
- critical scoring or evidence integrity fixes
- compliance/reporting changes that users rely on

## What should not force a release by itself

Examples:
- tiny README typo fixes
- purely internal refactors with no user impact
- speculative roadmap work not wired into the product yet

## Release hygiene

Each release should try to include:
- changelog updates
- version bump and artifacts
- verification that docs match shipped behavior
- confirmation that install paths still work
- regression test pass

## User expectation

For adopters, the healthy default is:
- follow stable minor releases
- read the changelog before upgrading
- treat major releases as explicit migration events
