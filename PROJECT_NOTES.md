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
- current capstone build plan:
  - finish the web tool during the current build phase
  - plan a pilot test during Fall 2026 with incoming students during simulation runs
  - if the Fall 2026 pilot includes systematic data collection, usability assessment, workload measures, performance comparison, or dissemination beyond internal course improvement, prepare for human-subjects IRB review rather than assuming NHSR

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
- planned next research milestone:
  - align the Summer 2026 IRB assignment deliverable with the longer-term Fall 2026 pilot-testing plan
  - clarify whether the July 12, 2026 submission is only an NHSR determination for the build phase or whether faculty want the pilot-testing protocol submitted now as well

## IRB Operational Guardrails

This section is meant to function as a practical research operations checklist during the Fall 2026 pilot phase. It does not replace Emory IRB approval, protocol language, or PI judgment. It is here so we can quickly sanity-check whether a proposed research step still matches the approved plan.

### Core Rule

- do not begin pilot testing with students until the study has the correct Emory IRB determination or approval in place for the pilot phase

### What Counts As Human-Subjects Activity For This Project

- pilot testing the web tool with incoming perfusion students during simulation runs
- collecting usability data
- collecting NASA-TLX or other workload data
- collecting timing, accuracy, task completion, or performance data tied to student participation
- analyzing those data as part of a systematic capstone or educational research project

### Platform And Data Rules

- preferred rule: the CPB support web tool should function as the intervention, not the storage location for identifiable participant research data
- preferred rule: do not store names, emails, student IDs, grades, or other identifiers inside the web tool unless the IRB submission and data-security review explicitly allow it
- if identifiable research data will be collected, shared, or stored using any platform hosted outside Emory, VA, or Children's:
  - stop and confirm whether OIT security review is required before use
  - examples include Netlify, GitHub Pages, Google Forms, SurveyMonkey, outside transcription vendors, or other third-party hosted tools
- if the tool is only being used during simulation and identifiable data are collected separately in an Emory-approved system, the external-platform question may remain `No`
- use Emory-approved systems such as REDCap, Qualtrics, or secure institutional storage for research data whenever possible
- avoid removable media such as USB drives or external hard drives unless specifically needed and appropriately secured
- do not transmit confidential data through non-institutional email

### Educational Records Rule

- answer `Yes` to educational-records questions only if the study will access official student records maintained by the school or program
- examples include grades, formal evaluations, academic standing, or institutional performance records
- answer `No` if the study only uses research data created during the pilot itself, such as simulation timing, study surveys, NASA-TLX responses, or study-specific observations

### Recruitment And Consent Rules

- recruitment should make clear that participation in the research portion is voluntary
- participation or non-participation must not affect grades, evaluations, standing, or access to required educational content
- if the simulation exercise is part of the curriculum, only data from students who consent to the research should be included in the analysis
- avoid coercive recruitment, especially when faculty are recruiting their own students

### When To Pause And Re-check IRB Before Proceeding

- if we add minors
- if we add patient data, PHI, or electronic medical record information
- if we add identifiable student records
- if we change from local or Emory-approved tools to third-party tools
- if we add AI or machine-learning components to the research intervention or data analysis workflow
- if we add text-message communication, social-media data collection, or outside vendors
- if we expand from a pilot to a broader comparative or publishable study beyond the approved scope

### Practical Session Check Before Each Pilot Run

- confirm the approved IRB pathway still matches the planned activity
- confirm the platform being used is the same platform described in the submission
- confirm no new identifiers are being collected unexpectedly
- confirm participation is voluntary and separated from grading
- confirm research data are stored only in the approved location
- confirm no one is exporting data to personal devices, personal email, or unapproved apps

## Mentor Follow-Up Checklist

This section captures the current build priorities that came out of mentor feedback so both project members can work from the same list.

### Highest Priority

- [ ] Add a `Pediatric Mode` workflow to make the tool more useful for all perfusionists, not just adult cases
- [ ] Decide and document the pediatric trigger logic
  - Recommendation: do not force pediatric mode automatically
  - Recommendation: if entered `weight`, `height`, and/or `BSA` suggest a pediatric profile, then let the user toggle `Pediatric Mode` on
- [ ] Define what changes when pediatric mode is active
  - pediatric-facing flow planning emphasis
  - pediatric prime support
  - pediatric cannula defaults/families
  - pediatric drug support surfaced first where appropriate

### Anticoagulation Updates

- [ ] Add a heparin tally system so total heparin given through the case can be tracked
- [ ] Use the heparin tally to calculate final protamine dose from `total heparin administered`
- [ ] If a full tally is not entered, keep fallback guidance:
  - `Protamine dose based off initial heparin dose`
- [ ] Add a clear UI choice for protamine calculation source
  - initial heparin dose only
  - total heparin given during case
- [ ] Add `AT3 / antithrombin III` support to the anticoagulation section
- [ ] Expand heparin-resistance support notes where relevant
- [ ] Add `Bivalirudin` dosing support
- [ ] Add `Argatroban` dosing support

### Prime / Pediatric Prime Updates

- [ ] Reassess whether `bicard` should remain in the current prime workflow
- [ ] Reassess whether `mannitol` should remain in the current prime workflow
- [ ] Add pediatric prime drugs/additives section
- [ ] Separate adult prime assumptions from pediatric prime assumptions where needed

### Drug Library Expansion

- [ ] Add `Argatroban`
- [ ] Add `DDAVP`
- [ ] Add `Insulin`
- [ ] Add a `paralysis / neuromuscular blockade` drug section
- [ ] Add `diuretics`
- [ ] Add `Cyanokit`
- [ ] Add `Methylene Blue`
- [ ] Add `AT3 / Antithrombin III`
- [ ] Recheck `Bivalirudin` entries so loading dose, bypass dosing, and reversal/bleeding management are all complete

### Suggested Build Order

- [ ] Step 1: finalize the pediatric-mode scope before adding multiple pediatric-specific features
- [ ] Step 2: build the heparin tally + final protamine workflow
- [ ] Step 3: expand pediatric prime support
- [ ] Step 4: finish missing anticoagulation drugs and rescue agents
- [ ] Step 5: finish the drug library additions

### Recommended Team Split

- [ ] Project Member A
  - pediatric mode logic
  - perfusion/prime/cannula behavior changes
  - heparin tally + protamine workflow
- [ ] Project Member B
  - drug library expansion
  - anticoagulation reference/dosing writeups
  - pediatric prime content review
  - reference cleanup and documentation updates

### Notes On The Heparin Tally Idea

The heparin tally idea is strong and should improve the anticoagulation section a lot.

- It is more clinically realistic than calculating protamine from the initial bolus only
- It lets the user account for repeat boluses during the case
- It can still remain simple if built as a running list:
  - initial bolus
  - added bolus 1
  - added bolus 2
  - added bolus 3
  - optional pump-prime heparin if you want to include that later
- The output should show both:
  - `Initial heparin dose`
  - `Total heparin dose tallied`
  - `Protamine dose source used`

### Open Decision To Make Before Building

- [ ] Decide whether pediatric mode should be triggered mainly by:
  - weight
  - BSA
  - an institution-defined pediatric cutoff
- [ ] Decide whether the first version of the heparin tally should include:
  - bolus doses only
  - bolus doses plus pump-prime heparin
  - bolus doses plus infusion dosing if applicable
