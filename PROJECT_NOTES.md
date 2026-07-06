# CPB Perfusion Tool Project Notes

## Project Purpose

Build a clear, mobile-friendly web tool for perfusion education, simulation, and planning support around common cardiopulmonary bypass calculations.

The bigger goal is for this to become more than a static calculator. It is intended to grow into a front-end cognitive aid and interactive workflow tool for perfusionists and perfusion students.

## PICOT Question

This PICOT should remain a central reference point for the project and should be reviewed when making design, workflow, and content decisions.

- P: perfusionists or perfusion students in simulated CPB/perfusion tasks
- I: CPB support tool, workflow calculator, or decision-support/cognitive aid
- C: usual practice, manual calculation, or no tool
- O: reduced cognitive load/workload, fewer calculation errors, improved workflow
- T: during simulation-based CPB activities

Working PICOT question:

In perfusionists or perfusion students performing simulated CPB or perfusion tasks, does use of a CPB support tool, workflow calculator, or decision-support cognitive aid, compared with usual practice, manual calculation, or no tool, reduce cognitive workload, reduce calculation errors, and improve workflow during simulation-based CPB activities?

## Preferred Evidence Sources

Because this project is clinically grounded and includes formula- and workflow-based content, evidence sources should be chosen carefully.

- Use peer-reviewed primary literature when possible
- Use specialty guidelines, standards, and society statements when available
- Use PubMed as the main literature database for clinical source gathering
- Use AmSECT, STS, SCA, and similar professional guidance when relevant to perfusion practice
- Use NCBI Bookshelf and StatPearls as supportive references, not the only authority for major formulas or recommendations
- Use other strong databases when needed, such as Cochrane Library, CINAHL, Embase, Google Scholar for citation tracing, and major perfusion, anesthesia, and cardiac surgery journals
- When a formula, dosing recommendation, or clinical target is important to the tool, try to trace it back to the most authoritative source available
- Add every new source used in the project to the master reference list in `references.html`

## Main Direction

The current main goal is:

- finish the static/front-end tool first
- continue building it into an interactive workflow tool
- reassess backend support later only if the project truly grows into needing it

For now, the project should remain:

- web-based
- front-end focused
- workflow oriented
- educational and simulation friendly

## Current Modules

- Home page
- Perfusion calculator
- Prime planner
- Anticoagulation support
- Cannula selection

## Current Workflow Vision

The tool is meant to support a typical perfusion workflow and reduce repeated mental math across the perioperative period. The broader vision includes support for:

- patient height and weight
- procedure planning
- cannula selection
- flow calculations
- anticoagulation
- priming
- drug support or library content
- algorithm support if something catastrophic happens
- interactive charts and visual aids

## Roadmap

### Capstone Study Preparation

- submit an IRB determination/review request before using the tool with students in the Califia heart-lung simulator or collecting NASA-TLX/workload, usability, timing, error-rate, or performance data
- prepare a short protocol describing the simulation scenario, participant group, voluntary consent process, NASA-TLX data collection, de-identification plan, data storage, and how participation will be separated from grading or course evaluation
- confirm with faculty/IRB whether the project qualifies as exempt or not-human-subjects research before beginning any student data collection

### Phase 1: Front-End Foundation

- refine calculation formulas and assumptions with reliable references
- improve mobile workflow for fast input during simulation
- add clearer result explanations and unit labels where helpful
- expand validation and edge-case handling
- prepare the app for presentation or deployment
- keep patient context shared across tabs where appropriate

### Phase 2: Interactive Workflow Tool

- expand the site from separate calculators into a more connected perfusion workflow
- add more tabs or modules for common perioperative support tasks
- add clearer workflow guidance and decision-support style explanations
- improve cross-tab continuity so repeated patient information is not re-entered
- create more interactive front-end tools instead of static output-only pages

### Phase 3: Advanced Interactive Features

- add interactive graphs for perfusion cannula selection
- add an interactive Heparin Dose Response Curve tool
- add richer anticoagulation workflow support
- add more interactive recommendations and visual aids
- expand emergency or catastrophic event algorithm support

### Phase 4: Reassess Backend Need

Only consider backend support later if the project starts needing things like:

- saved cases
- user accounts
- shared workflows
- institutional customization
- protected data
- more advanced decision-support behavior

## Feature Ideas

- save or reset common patient scenarios
- add preset adult or pediatric assumptions
- add reference ranges or protocol notes
- add print or export-friendly summary view
- add dark mode or presentation mode
- add a dedicated references page
- build a broader drug support or medication reference section
- add workflow-based support rather than isolated calculators only

## Platform Plan

The working platform plan is:

- keep building in the current HTML, CSS, and JavaScript format
- use GitHub for collaboration and version control
- use Netlify later if ready to launch the front-end publicly
- keep Streamlit in mind only later if the project becomes much more Python or data-app heavy

## Collaboration Plan

- use GitHub for collaboration
- use feature branches for separate tasks
- keep `main` as the stable version
- merge when a small feature is stable and tested
- if a partner also uses Codex, divide ownership clearly by feature or file area

## Decisions

- keep project planning notes in Markdown so they are easy to read on GitHub and easy to update in Codex
- keep calculation logic separated from UI code so formulas can be tested directly
- prioritize the front-end workflow tool before deciding on backend complexity
- keep this tool educational, simulation-friendly, and practically useful during development

## Open Questions

- is the main audience students, simulation participants, practicing perfusionists, or instructors?
- should the tool stay educational only, or should it be framed as clinical decision support with stronger disclaimers?
- what formulas and institutional assumptions should be considered authoritative for this project?
- when the tool becomes more comprehensive, which modules should be prioritized first?
- when does the project truly cross the line into needing backend support?

## Next Session Notes

- add any new ideas, pending tasks, or reminders here before ending a work session
- continue building the front-end workflow tool first
- revisit backend support only later if the project clearly outgrows the static/front-end model
