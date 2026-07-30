# CPB Perfusion Tool

Mobile-friendly perfusion support pages for education, simulation, and planning around common cardiopulmonary bypass calculations.

## Source Of Truth

This GitHub repository is the working source of truth for the project.

- Make code changes in `/Users/mydo/Documents/GitHub/CPB-Perfusion-Tool`
- Do not treat other local folders with similar project files as the primary working copy
- If there is a mismatch between this repo and another local folder, use this repo as the authoritative version unless the owner explicitly says otherwise

## Collaboration Note

For anyone helping with this project, including AI collaborators:

- Start work from the GitHub repo folder, not from duplicate local folders
- Check the current repo status before editing
- Keep new changes inside this repository so commits, diffs, and reviews stay accurate

## Reference Workflow

- The master source list lives in `/Users/mydo/Documents/GitHub/CPB-Perfusion-Tool/references.html`
- When a new reference is used for project content, add it to the master reference list
- Page-level reference sections can stay in place, but the master references page should remain the complete source list
- Capstone assignment language and reusable research-planning details are summarized in `PROJECT_NOTES.md` under `Capstone Proposal Source Bank`

## Current Scope

- Perfusion flow and cardiac index calculations
- Prime planning support
- Anticoagulation support
- Cannula selection with estimated pressure drops
- Drug information library
- Shared patient context across tabs where appropriate
- Mobile-friendly educational interface for simulation and planning
- Guided introductory mode for students with limited prior CPB exposure

The tool is intended for education and simulation only. It is not medical advice and must not be used to make decisions about actual patient care.

## Project Plan

### Capstone Goal

Develop and pilot a mobile-friendly, web-based CPB perfusion support tool that assists perfusion students through common operative planning and calculation tasks. The project is intended to improve calculation accuracy, workflow efficiency, access to information, and perceived cognitive workload during simulation-based learning.

### Primary Deliverables

1. A functioning educational web application containing the planned calculation and reference modules.
2. Verified calculation logic and clearly cited educational content.
3. A simulation-ready workflow that supports conventional/manual task completion and use of the web tool.
4. IRB-approved participant-facing and research materials.
5. A pilot evaluation using workload, usability, timing, accuracy, and task-completion measures.
6. A capstone report summarizing development, study methods, results, limitations, and recommendations.

### Planned Research Study

- **IRB study title:** Pilot Evaluation of a Web-Based Cardiopulmonary Bypass Support Tool During Perfusion Student Simulation Training
- **Principal investigator:** Leslie Jeter
- **Student investigators:** My Do and Sydney Lias
- **Funding:** No external funding
- **Setting:** Dedicated perfusion simulation rooms at Emory Nursing Learning Center (ENLC), including access to high-fidelity simulation space and needed perfusion training equipment
- **Population:** Currently enrolled Emory perfusion students age 18 or older
- **Recruitment pool:** Eligible incoming students, with currently enrolled senior students included as optional near-peer or expert feedback participants if approved in the final protocol
- **Enrollment ceiling:** Up to 30 consented participants, allowing for ineligibility, withdrawal, and incomplete data
- **Expected completed participants:** Approximately 20, depending on eligibility and voluntary participation
- **Individual participation:** One session lasting approximately 90 minutes
- **Compensation:** None
- **Consent:** Written paper consent or an IRB-approved electronic consent process using a legally valid electronic signature

### Planned Study Procedures

1. Obtain informed consent before research procedures or data collection.
2. Provide study and tool instructions.
3. Conduct a guided simulation-based CPB planning activity using an adult cardiac surgery case scenario on the Califia heart-lung simulator.
4. Include case details such as height, weight, diagnosis, planned procedure, baseline hematocrit or hemoglobin, selected laboratory values, and the information needed for introductory perfusion planning tasks.
5. Focus incoming-student activities on basic educational tasks rather than independent clinical decision-making.
6. Ask participants to complete approved tasks such as using a fail-safe checklist, completing basic flow or cardiac index calculations, following timer-based workflow prompts, reviewing prime or hemodilution concepts, and accessing instructional support for building an A-V loop or circuit.
7. Conduct simulation tasks using the approved study sequence. Some participants may complete conventional/manual educational tasks before tool-assisted tasks; every participant will have an opportunity to use the tool.
8. Record approved simulation-performance measures, including completion time, calculation accuracy, and task completion.
9. Administer the NASA Task Load Index (NASA-TLX).
10. Administer a usability survey.
11. Collect only the limited demographic and educational-background variables listed in the approved protocol.
12. Conduct a short debrief.

Participation in the research portion is voluntary and will not affect grades, evaluations, academic standing, or access to educational activities. No clinical care, medical-record review, biological specimens, or protected health information are planned.

### Data Plan

- Use study codes rather than participant names on research records whenever possible.
- Collect survey and study data through the Emory-approved platform(s) named in the final protocol, currently REDCap and/or Qualtrics.
- Keep any code key separate from the coded research data.
- Store downloaded files only on encrypted, password-protected Emory-approved devices or secure institutional storage.
- Limit access to approved study personnel.
- Do not use the CPB Support Tool as the primary storage location for identifiable research data.
- Do not share identifiable data with external collaborators.
- Report findings in de-identified or aggregate form.
- Retain research records for at least six years after study closure, or longer if required by the final IRB determination or Emory policy.

### Anticipated Risks and Controls

- **Simulation stress, fatigue, frustration, or embarrassment:** Participants may pause, skip survey questions, or stop participation.
- **Loss of privacy or confidentiality:** Use coded data, restricted access, secure Emory systems, and aggregate reporting.
- **Incorrect or incomplete tool outputs:** Use the tool only in simulation, verify calculation logic before the pilot, and display clear educational-use limitations.
- **Perceived academic pressure:** Separate research participation from grading and make voluntariness explicit during recruitment and consent.
- **Scope and feasibility:** Prioritize the approved pilot features and document deferred features rather than expanding the study during implementation.

### Research Readiness Checklist

- [ ] Receive the formal Emory IRB approval or exempt-determination letter before recruitment or data collection.
- [ ] Use the exact same study title across the IRB application, consent form, recruitment materials, surveys, and project documentation.
- [ ] Align the enrollment field with the approved ceiling of 30 and the anticipated completion count of approximately 20.
- [ ] Record the eligible age range as 18 or older with no upper limit unless the IRB approves a specific maximum.
- [ ] Ensure the detailed protocol includes incoming and senior students if both groups will be recruited.
- [ ] Identify My Do and Sydney Lias's recruitment and consent responsibilities consistently across the protocol and study documents.
- [ ] Name the manual/tool sequence, NASA-TLX, usability survey, performance measures, demographics, and debrief consistently in the protocol and consent.
- [ ] Use the same approved data platform language in the IRB application and consent form.
- [ ] Confirm with the IRB analyst whether the tool should be classified as in-house digital health or healthcare software and document its hosting behavior.
- [ ] Confirm that the tool does not store or transmit participant identifiers, research data, or real patient information.
- [ ] Complete the study-contact telephone number and PI financial-interest statement in the consent form.
- [ ] Submit the final consent form and all participant-facing materials for IRB review.
- [ ] Define separate demo profiles or tool modes for limited-exposure students and more advanced student users.
- [ ] Decide which pilot modules belong in the introductory student mode, such as checklist, basic flow/cardiac index, timer prompts, circuit/A-V loop instructional support, prime concepts, and any limited reference content.

### Pilot Acceptance Criteria

The pilot will be ready to begin when:

- The formal IRB determination and all required institutional approvals are documented.
- The approved consent, recruitment, simulation, NASA-TLX, usability, and data-collection materials are finalized.
- Required calculation pathways pass documented test cases and do not contain known high-risk output errors.
- The interface functions on the mobile and desktop devices planned for the simulation.
- The educational-use limitation is visible and the tool is not connected to clinical records or patient-care workflows.
- The simulation sequence and data-capture process can be completed within the planned 90-minute session.
- Research data can be collected, coded, exported, stored, and accessed according to the approved data plan.

## Verification

- Run `npm run verify` for a quick local health check before larger UI changes.
- GitHub Actions now runs the same verification automatically on pushes and pull requests.
