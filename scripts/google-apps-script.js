/**
 * Google Apps Script Webhook Handler for OpenSTEM Match (openstembridge.space)
 * 
 * Google Spreadsheet: "OpenSTEM Match — Research & Talent Submissions"
 * Spreadsheet ID: 1iNvocmxJVAJPQyU8nfn3AnSy23WFjRceFGFwbNnTu34
 * Link: https://docs.google.com/spreadsheets/d/1iNvocmxJVAJPQyU8nfn3AnSy23WFjRceFGFwbNnTu34/edit
 * 
 * Instructions to Deploy:
 * 1. Open your open Google Apps Script tab (or go to script.google.com)
 * 2. Paste this entire file into Code.gs
 * 3. Click "Save" (disk icon)
 * 4. Click "Deploy" -> "New deployment"
 *    - Type: "Web app"
 *    - Description: "OpenSTEM Match Form Webhook"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone"
 * 5. Click "Deploy", authorize permissions when prompted, and copy the Web App URL.
 * 6. Send the URL here (or paste it into app.js).
 */

var SPREADSHEET_ID = "1iNvocmxJVAJPQyU8nfn3AnSy23WFjRceFGFwbNnTu34";
var NOTIFICATION_EMAIL = "shahriyarkarimsiam@gmail.com";

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "OpenSTEM Match Webhook is active and listening",
    spreadsheetId: SPREADSHEET_ID,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var raw = e && e.postData ? e.postData.contents : "{}";
    var data = JSON.parse(raw);
    var category = data.form_category || (data.project_title ? "researcher" : (data.research_goal ? "student" : "interest"));
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var timestamp = Utilities.formatDate(new Date(), "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss");

    // 1. Research Project Call (Researcher / Lab)
    if (category === "researcher" || data.project_title) {
      var sheet1 = ss.getSheetByName("Research Project Calls");
      if (!sheet1) sheet1 = ss.getSheets()[0];
      
      sheet1.appendRow([
        timestamp,
        data.full_name || "",
        data.email || "",
        data.institution || "",
        data.discipline || "",
        data.opportunity_type || "",
        data.project_title || "",
        data.weekly_hours || "",
        data.duration || "",
        data.work_mode || "",
        data.deadline || "",
        data.compensation_detail || "",
        data.location_detail || "",
        data.required_skills || "",
        data.project_summary || "",
        data.mentor_support || "",
        data.eligibility || "",
        data.public_opt_in ? "Yes" : "No",
        "New / Pending Review"
      ]);

      sendNotificationEmail(
        "🔬 New Research Call Brief: " + (data.project_title || "Untitled Call"),
        "Research Project Call",
        data,
        timestamp
      );

      return ContentService.createTextOutput(JSON.stringify({ status: "ok", category: "researcher" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Student Application / Profile
    if (category === "student" || data.research_goal) {
      var sheet2 = ss.getSheetByName("Student Talent Profiles");
      if (!sheet2) sheet2 = ss.getSheets()[1];

      sheet2.appendRow([
        timestamp,
        data.full_name || "",
        data.email || "",
        data.institution || "",
        data.academic_level || "",
        data.discipline || "",
        data.research_area || "",
        data.skills || "",
        data.evidence_url || "",
        data.availability_hours || "",
        data.timezone_region || "",
        data.collaboration_mode || "",
        data.research_goal || "",
        data.bio || "",
        data.public_opt_in ? "Yes" : "No",
        "New / Pending Review"
      ]);

      sendNotificationEmail(
        "🎓 New Student Talent Application: " + (data.full_name || "Applicant") + " (" + (data.discipline || "STEM") + ")",
        "Student Talent Profile",
        data,
        timestamp
      );

      return ContentService.createTextOutput(JSON.stringify({ status: "ok", category: "student" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Project Expression of Interest
    var sheet3 = ss.getSheetByName("Expressions of Interest");
    if (!sheet3) sheet3 = ss.getSheets()[2];

    sheet3.appendRow([
      timestamp,
      data.project_title || data.project_id || "Direct Inquiry",
      data.full_name || "",
      data.email || "",
      data.institution || "",
      data.academic_level || "",
      data.skills || "",
      data.evidence_url || "",
      data.motivation || "",
      "New / Pending Review"
    ]);

    sendNotificationEmail(
      "✳️ New Expression of Interest: " + (data.full_name || "Candidate") + " → " + (data.project_title || "Project"),
      "Expression of Interest",
      data,
      timestamp
    );

    return ContentService.createTextOutput(JSON.stringify({ status: "ok", category: "interest" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendNotificationEmail(subject, categoryName, data, timestamp) {
  var tableHtml = "";
  var fieldsToDisplay = [
    { key: "full_name", label: "Full Name" },
    { key: "email", label: "Email Address" },
    { key: "institution", label: "Institution / Organization" },
    { key: "discipline", label: "Discipline" },
    { key: "academic_level", label: "Academic Level" },
    { key: "opportunity_type", label: "Opportunity Type" },
    { key: "project_title", label: "Project Title" },
    { key: "weekly_hours", label: "Weekly Commitment" },
    { key: "duration", label: "Duration" },
    { key: "work_mode", label: "Work Mode" },
    { key: "deadline", label: "Application Deadline" },
    { key: "compensation_detail", label: "Compensation / Stipend" },
    { key: "required_skills", label: "Required Skills" },
    { key: "skills", label: "Applicant Skills" },
    { key: "research_area", label: "Research Focus" },
    { key: "evidence_url", label: "Evidence URL / Portfolio" },
    { key: "availability_hours", label: "Availability" },
    { key: "project_summary", label: "Project Summary" },
    { key: "mentor_support", label: "Mentorship Support" },
    { key: "eligibility", label: "Eligibility Criteria" },
    { key: "research_goal", label: "Research Goal" },
    { key: "motivation", label: "Motivation Statement" },
    { key: "bio", label: "Bio / Background" }
  ];

  for (var i = 0; i < fieldsToDisplay.length; i++) {
    var item = fieldsToDisplay[i];
    var val = data[item.key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      var isUrl = String(val).indexOf("http://") === 0 || String(val).indexOf("https://") === 0;
      var valFormatted = isUrl 
        ? '<a href="' + val + '" style="color:#007a5a;font-weight:bold;" target="_blank">' + val + ' ↗</a>' 
        : String(val).replace(/\n/g, "<br/>");
      
      tableHtml += '<tr>' +
        '<td style="padding:10px 14px;border-bottom:1px solid #e1e7e3;font-weight:bold;color:#0b2533;background:#f5f8f6;width:34%;font-size:12.5px;">' + item.label + '</td>' +
        '<td style="padding:10px 14px;border-bottom:1px solid #e1e7e3;color:#1e3532;font-size:13px;">' + valFormatted + '</td>' +
      '</tr>';
    }
  }

  var htmlBody = 
    '<div style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Arial,sans-serif;max-width:640px;margin:auto;border:1px solid #c8d9ce;border-radius:10px;background:#ffffff;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.06);">' +
      '<div style="background:#0b2533;padding:24px 28px;color:#ffffff;">' +
        '<span style="font-size:10px;letter-spacing:1.8px;font-weight:800;color:#c9efa0;text-transform:uppercase;">OPENSTEM MATCH · ' + categoryName.toUpperCase() + '</span>' +
        '<h2 style="margin:8px 0 0 0;font-size:21px;color:#ffffff;line-height:1.25;">' + subject + '</h2>' +
      '</div>' +
      '<div style="padding:22px 28px;">' +
        '<p style="color:#4a635c;font-size:13.5px;margin:0 0 18px 0;line-height:1.6;">' +
          'A new submission was received on <strong>openstembridge.space</strong> at <strong>' + timestamp + '</strong> and recorded directly into your Google Sheet.' +
        '</p>' +
        '<table style="width:100%;border-collapse:collapse;margin:15px 0;border:1px solid #e1e7e3;border-radius:6px;overflow:hidden;">' +
          tableHtml +
        '</table>' +
        '<div style="margin-top:26px;padding-top:18px;border-top:1px solid #e7eee9;text-align:center;">' +
          '<a href="https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/edit" style="display:inline-block;background:#0b2533;color:#c9efa0;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:700;font-size:12.5px;">Open in Google Sheets ↗</a>' +
        '</div>' +
      '</div>' +
      '<div style="background:#f4f7f5;padding:12px 28px;font-size:11px;color:#7a8e87;border-top:1px solid #e7eee9;text-align:center;">' +
        'OpenSTEM Match Verified Exchange · <a href="https://openstembridge.space" style="color:#206148;">openstembridge.space</a>' +
      '</div>' +
    '</div>';

  try {
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: "[OpenSTEM Match] " + subject,
      htmlBody: htmlBody,
      replyTo: data.email || NOTIFICATION_EMAIL
    });
  } catch (err) {
    Logger.log("Email notification error: " + err);
  }
}
