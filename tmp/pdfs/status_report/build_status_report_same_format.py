from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)


ROOT = Path("/Users/mydo/Documents/GitHub/CPB-Perfusion-Tool")
ASSIGNMENTS = Path("/Users/mydo/Desktop/Perfusion School/Summer /Project Planning 613 /Assignments")
OUT_DIR = ROOT / "output" / "pdf"
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT = OUT_DIR / "Project Status Report CVP 613 Updated Same Format 2026-08-05.pdf"
ASSIGNMENT_COPY = ASSIGNMENTS / "Project Status Report, CVP 613 - Updated Same Format 2026-08-05.pdf"


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=18,
        alignment=TA_CENTER,
        spaceAfter=12,
    )
)
styles.add(
    ParagraphStyle(
        "SectionTitle",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=17,
        alignment=TA_CENTER,
        spaceBefore=10,
        spaceAfter=4,
    )
)
styles.add(
    ParagraphStyle(
        "Instruction",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=12,
        leading=14,
        alignment=TA_CENTER,
        spaceAfter=4,
    )
)
styles.add(
    ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=12,
    )
)
styles.add(
    ParagraphStyle(
        "Small",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8,
        leading=9.5,
    )
)
styles.add(
    ParagraphStyle(
        "TableText",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8.8,
        leading=10.5,
    )
)
styles.add(
    ParagraphStyle(
        "TableBold",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=8.8,
        leading=10.5,
    )
)
styles.add(
    ParagraphStyle(
        "GanttText",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=7.4,
        leading=8.4,
    )
)
styles.add(
    ParagraphStyle(
        "GanttHead",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=8.4,
        leading=9.4,
        alignment=TA_CENTER,
    )
)
styles.add(
    ParagraphStyle(
        "CellCenter",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8,
        leading=8.8,
        alignment=TA_CENTER,
    )
)


green = colors.HexColor("#C6E0B4")
green_bar = colors.HexColor("#8CD976")
blue = colors.HexColor("#9DC3E6")
yellow = colors.HexColor("#FFE699")
grey = colors.HexColor("#D9D9D9")
red = colors.HexColor("#F4CCCC")
teal = colors.HexColor("#1F6D86")
light_green = colors.HexColor("#D9EAD3")


def p(text, style="Body"):
    return Paragraph(text, styles[style])


def make_doc(path):
    return SimpleDocTemplate(
        str(path),
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.62 * inch,
        bottomMargin=0.62 * inch,
    )


story = []

story.append(p("CVP Capstone Project Status Report*<br/>CVP 613", "ReportTitle"))
meta_rows = [
    [p("Capstone Project Name: CPB Support Tool", "Body")],
    [p("Project Managers (Group): Sydney Lias and My Do", "Body")],
    [p("Date of Status Entry: 8/5/26", "Body")],
    [p("Period Covered: 6/25/26 - 8/5/26", "Body")],
    [p("Project Start Date: 4/25/26", "Body")],
]
meta = Table(meta_rows, colWidths=[6.5 * inch], rowHeights=[0.22 * inch] * 5)
meta.setStyle(
    TableStyle(
        [
            ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ]
    )
)
story.extend([meta, Spacer(1, 20)])

story.append(p("Summary and Overall Project Status", "SectionTitle"))
story.append(p("Enter information about the overall project health status and highlights", "Instruction"))
summary_text = (
    "<b>Overall Status: GREEN (On Track)</b><br/>"
    "The CPB Support Tool remains on track and has progressed since the previous status report. The working prototype now includes perfusion, prime, anticoagulation, cannula selection, drug library, electrolytes/blood gas, blood products/blood management, and master references sections.<br/>"
    "The team has also aligned the project with updated Proposal 1 and Proposal 2 language, including the pilot-study design, planned outcomes, data-management approach, human-subjects protections, final presentation, and poster-support materials.<br/>"
    "No critical red items are identified at this time. The main attention areas are IRB approval/determination, final participant-facing materials, simulation dry-run preparation, source verification, and keeping the Fall 2026 pilot scope aligned with approved introductory-student tasks.<br/>"
    "Budget impact remains minimal; the main constraints are time, IRB readiness, source verification, and keeping tool development synchronized with capstone documentation."
)
summary = Table([[p(summary_text, "Body")]], colWidths=[6.5 * inch])
summary.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, -1), green),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.black),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]
    )
)
story.extend([summary, Spacer(1, 36)])

story.append(p("Milestones/Tasks", "SectionTitle"))
header = [
    p("Not Yet Started", "Body"),
    p("On<br/>Track/In<br/>Progress", "Body"),
    p("At Risk", "Body"),
    p("Off Track", "Body"),
    p("Completed", "Body"),
    p("Responsible<br/>Team<br/>Member", "Body"),
]
tasks = [
    ("Weekly project coordination and milestone tracking - GREEN", green_bar, "My/Sydney"),
    ("Core CPB calculator build (perfusion, prime, anticoagulation) - BLUE", blue, "Team"),
    ("Anticoagulation expansion: heparin tally, HDR curve, AT3, bivalirudin - BLUE", blue, "Team"),
    ("Cannula selection workflow and pressure-drop visualization - GREEN", green_bar, "Team"),
    ("Drug, electrolyte/blood gas, and blood product reference modules - GREEN", green_bar, "Team"),
    ("Master references optimization and module-based source organization - BLUE", blue, "Team"),
    ("Proposal 1 and 2 content integrated into project notes and presentation - BLUE", blue, "Team"),
    ("Final capstone presentation and poster-support materials - BLUE", blue, "Team"),
    ("Participant-facing IRB materials and data-collection tools - YELLOW", yellow, "Team/PI"),
    ("IRB approval/determination before recruitment or data collection - YELLOW", yellow, "PI/Team"),
    ("Fall 2026 pilot simulation preparation and case rehearsal - GREEN", green_bar, "Team"),
    ("Pediatric mode and additional future drug-library expansion - GREY", grey, "Future scope"),
]
task_rows = [header]
for task, _, owner in tasks:
    task_rows.append([p(task, "TableBold"), "", "", "", "", p(owner, "TableText")])

task_table = Table(
    task_rows,
    colWidths=[1.25 * inch, 1.0 * inch, 1.08 * inch, 1.08 * inch, 1.1 * inch, 0.99 * inch],
    rowHeights=[0.54 * inch] + [0.22 * inch] * len(tasks),
)
task_style = [
    ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
    ("BACKGROUND", (0, 0), (0, 0), grey),
    ("BACKGROUND", (1, 0), (1, 0), green),
    ("BACKGROUND", (2, 0), (2, 0), yellow),
    ("BACKGROUND", (3, 0), (3, 0), red),
    ("BACKGROUND", (4, 0), (4, 0), blue),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 5),
    ("RIGHTPADDING", (0, 0), (-1, -1), 5),
]
for idx, (_, color, _) in enumerate(tasks, start=1):
    task_style.extend(
        [
            ("SPAN", (0, idx), (4, idx)),
            ("BACKGROUND", (0, idx), (4, idx), color),
            ("BACKGROUND", (5, idx), (5, idx), colors.white),
        ]
    )
task_table.setStyle(TableStyle(task_style))
story.append(task_table)

story.append(PageBreak())

story.append(Spacer(1, 45))
story.append(p("Highlights and Key Takeaways", "SectionTitle"))
story.append(p("Bullet points of great work, who owns what tasks, where teams are pivoting, etc.", "Instruction"))
highlights = (
    "Working prototype has expanded beyond the June build and now covers calculation support, workflow visualization, and reference/learning support.<br/>"
    "Anticoagulation support now includes heparin loading, additional heparin projection, heparin administration log, protamine from tallied heparin, AT3 dosing, bivalirudin loading dose, and a heparin response curve.<br/>"
    "Cannula selection now includes arterial, venous, and optional bicaval planning with flow-based pressure-drop visualization.<br/>"
    "Reference content has expanded to include a drug library, electrolyte/blood gas ranges, blood products and blood management, and a module-organized master reference page.<br/>"
    "Proposal 1 and Proposal 2 content has been incorporated into the current project identity, methods, outcomes, data plan, human-subjects guardrails, and presentation/poster materials.<br/>"
    "Next steps are to complete IRB readiness items, rehearse the simulation case and scoring process, and keep the Fall 2026 pilot scope aligned with the approved protocol."
)
highlight_box = Table([[p(highlights, "Body")]], colWidths=[6.5 * inch])
highlight_box.setStyle(
    TableStyle(
        [
            ("BOX", (0, 0), (-1, -1), 0.5, colors.black),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ]
    )
)
story.extend([highlight_box, Spacer(1, 16)])
story.append(p("*Adapted from smartsheet.com and Linkedin", "Instruction"))
story.append(Spacer(1, 26))

story.append(p("Project Timeline GANTT Chart", "SectionTitle"))
months = ["6/25", "7/4", "8/1", "8/15", "9/1", "10/1", "11/1", "12/1"]
gantt_header = [p("Examples of Tasks<br/>& Milestones", "Body")] + [p(m, "Body") for m in months]
gantt_tasks = [
    ("Regular project team meetings", [0, 1, 2, 3, 4], blue),
    ("Proposal drafts/updates", [0, 1, 2], blue),
    ("Proposal / presentation drafts and final", [1, 2], blue),
    ("IRB determination / approval", [2, 3, 4, 5], yellow),
    ("Update ROL / study flow diagram", [0, 1, 2], green_bar),
    ("Create/update evidence table", [1, 2], green_bar),
    ("Update literature appraisal/synthesis", [1, 2], green_bar),
    ("Conduct organizational assessment", [1, 2], green_bar),
    ("Update methods and data plan", [1, 2], blue),
    ("Data management and security plan", [2, 3, 4], yellow),
    ("Communication plan / recruitment materials", [2, 3], light_green),
    ("Budget/constraints monitoring", [0, 1, 2, 3, 4, 5], blue),
    ("Workflow diagram / implementation plan", [1, 2, 3], light_green),
    ("Simulation dry run and pilot prep", [3, 4, 5], light_green),
    ("Recruitment after IRB approval", [5, 6], grey),
    ("Simulation pilot sessions", [5, 6, 7], grey),
    ("Data review and tool refinement", [6, 7], grey),
    ("Final report / dissemination", [6, 7], grey),
]
gantt_rows = [gantt_header]
for task, active, color in gantt_tasks[:14]:
    row = [p(task, "GanttText")]
    for i in range(len(months)):
        row.append(p("", "GanttText"))
    gantt_rows.append(row)

gantt = Table(gantt_rows, colWidths=[1.75 * inch] + [0.59 * inch] * 8)
gantt_style = [
    ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#8ECBE6")),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 4),
    ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]
for r, (_, active, color) in enumerate(gantt_tasks[:14], start=1):
    for i in active:
        gantt_style.append(("BACKGROUND", (i + 1, r), (i + 1, r), color))
gantt.setStyle(TableStyle(gantt_style))
story.append(gantt)

story.append(PageBreak())

cont_rows = []
for task, active, color in gantt_tasks[14:]:
    row = [p(task, "GanttText")]
    for i in range(len(months)):
        row.append(p("", "GanttText"))
    cont_rows.append(row)
cont = Table(cont_rows, colWidths=[1.75 * inch] + [0.59 * inch] * 8, rowHeights=[0.42 * inch] * len(cont_rows))
cont_style = [
    ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 4),
    ("RIGHTPADDING", (0, 0), (-1, -1), 4),
]
for r, (_, active, color) in enumerate(gantt_tasks[14:]):
    for i in active:
        cont_style.append(("BACKGROUND", (i + 1, r), (i + 1, r), color))
cont.setStyle(TableStyle(cont_style))
story.append(Spacer(1, 12))
story.append(cont)
story.append(Spacer(1, 16))

story.append(p("Updated Action Items", "SectionTitle"))
actions = (
    "Confirm formal IRB approval or determination before recruitment or pilot data collection.<br/>"
    "Finalize consent, recruitment, simulation instructions, surveys, debrief questions, checklist, timing method, and scoring guide.<br/>"
    "Run a simulation dry run to test case flow, student instructions, tool access, timing capture, and data collection.<br/>"
    "Freeze the approved pilot feature scope and keep pediatric mode or additional drug-library expansion in future scope unless approved.<br/>"
    "Continue documenting verified formulas, source references, and calculation test cases."
)
action_box = Table([[p(actions, "Body")]], colWidths=[6.5 * inch])
action_box.setStyle(
    TableStyle(
        [
            ("BOX", (0, 0), (-1, -1), 0.5, colors.black),
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F2F2F2")),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]
    )
)
story.append(action_box)
story.append(Spacer(1, 14))
story.append(
    p(
        "*Updated from the 6/25/26 version using current project notes, proposal-integrated planning language, README status, and successful verification run on 8/5/26.",
        "Small",
    )
)

doc = make_doc(OUT)
doc.build(story)
ASSIGNMENT_COPY.write_bytes(OUT.read_bytes())
print(OUT)
print(ASSIGNMENT_COPY)
