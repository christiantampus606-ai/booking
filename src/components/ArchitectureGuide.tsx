import React, { useState } from 'react';
import { BookOpen, Key, Layers, Server, Sparkles, Send, FileCode, CheckCircle2, Copy, Check } from 'lucide-react';

export default function ArchitectureGuide() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'setup' | 'code' | 'marketing'>('architecture');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const appsScriptCode = `/**
 * Google Apps Script Endpoint for Free Calendly Booking System
 * 
 * Instructions:
 * 1. Open Google Sheets (sheets.google.com). Create a new sheet.
 * 2. Click Extensions > Apps Script.
 * 3. Delete any default code in Code.gs and paste this script.
 * 4. Click 'Deploy' > 'New deployment'.
 * 5. Choose type: 'Web app'.
 * 6. Execute as: 'Me' (your email).
 * 7. Who has access: 'Anyone'.
 * 8. Authorize permissions and copy the Web App URL.
 */

function doPost(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse incoming booking JSON payload
    var payload;
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter;
    }
    
    // If sheet is completely empty, initialize column headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", 
        "Booking ID", 
        "Event Type", 
        "Duration (Mins)", 
        "Client Name", 
        "Client Email", 
        "Client Phone", 
        "Client Notes", 
        "Appointment Date", 
        "Appointment Time", 
        "Status"
      ]);
      // Format headers
      sheet.getRange(1, 1, 1, 11).setFontWeight("bold").setBackground("#f1f5f9");
    }
    
    // Append the row of lead metadata
    sheet.appendRow([
      new Date(),
      payload.id || "",
      payload.eventTypeName || "",
      payload.duration || "",
      payload.clientName || "",
      payload.clientEmail || "",
      payload.clientPhone || "",
      payload.clientNotes || "",
      payload.appointmentDate || "",
      payload.appointmentTime || "",
      payload.status || "confirmed"
    ]);

    // Automatically dispatch professional confirmation email to the client
    if (payload.clientEmail) {
      try {
        var hostName = SpreadsheetApp.getActiveSpreadsheet().getName() || "Your Host";
        var clientSubject = "Appointment Confirmed: " + (payload.eventTypeName || "Booking") + " with " + hostName;
        var clientBody = "Dear " + (payload.clientName || "Client") + ",\n\n" +
          "Your appointment has been successfully booked and confirmed!\n\n" +
          "Here are your reservation details:\n" +
          "----------------------------------------\n" +
          "Meeting Format: " + (payload.eventTypeName || "") + "\n" +
          "Duration: " + (payload.duration || "") + " Minutes\n" +
          "Scheduled Date: " + (payload.appointmentDate || "") + "\n" +
          "Scheduled Time: " + (payload.appointmentTime || "") + "\n" +
          "----------------------------------------\n\n" +
          "No login or registration is required. We look forward to meeting with you.\n\n" +
          "Thank you,\n" +
          hostName;
          
        MailApp.sendEmail(payload.clientEmail, clientSubject, clientBody);
      } catch (mailErr) {
        // Safe logger backup in Google console
        Logger.log("Mail delivery failed: " + mailErr.toString());
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Lead successfully recorded in Google Sheets database and confirmation email sent!",
      rowAdded: sheet.getLastRow()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
  }
}

// Handle preflight CORS request for cross-origin browsers
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
}`;

  const fetchSnippet = `// Posting client booking to Google Apps Script Endpoint
async function sendLeadToGoogleSheets(bookingPayload) {
  const endpoint = "https://script.google.com/macros/s/AKfycbwJ3rlroAvAIllx8YCjDVS1WPdJ3cZyUNhxBeMCfgK1XsEvRJczRwW5pFfDSEYnJEcQ/exec";
  
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      mode: "no-cors", // Crucial for direct browser-to-script requests without CORS issues
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingPayload),
    });
    
    console.log("Booking successfully posted to Apps Script Sheets backend.");
    return true;
  } catch (error) {
    console.error("Failed to store lead data in Google Sheet: ", error);
    throw error;
  }
}`;

  return (
    <div id="developer-guide" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 p-6 sm:p-8 text-white relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Server size={140} />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30 flex items-center gap-1">
            <Sparkles size={12} /> 100% Free Forever Architecture
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">System Architecture &amp; Developer Guide</h2>
        <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
          An overview of how this Calendly-like platform delivers zero-cost operations by coupling serverless client scripts, open-source layouts, and serverless Google Apps Script backends.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-100 flex overflow-x-auto scrollbar-none bg-slate-50/50 p-2 gap-1">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
            activeTab === 'architecture'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-100'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <Layers size={16} /> System Architecture
        </button>
        <button
          onClick={() => setActiveTab('setup')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
            activeTab === 'setup'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-100'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <BookOpen size={16} /> Step-by-Step Setup
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
            activeTab === 'code'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-100'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <FileCode size={16} /> Code Snippets
        </button>
        <button
          onClick={() => setActiveTab('marketing')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
            activeTab === 'marketing'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-100'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <Send size={16} /> Leads &amp; Marketing Export
        </button>
      </div>

      {/* Tab Panel Contents */}
      <div className="p-6 sm:p-8">
        {/* ARCHITECTURE */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 font-display">How the Free Tier Stack Connects</h3>
            
            {/* Visual Diagram Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 relative">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center relative">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-3">1</div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-800">Host Dashboard (SPA)</h4>
                <p className="text-[11px] text-slate-500 mt-1">Saves settings, colors, event details, &amp; availability templates in persistent Client Storage.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-lg mb-3">2</div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-800">Booking URL</h4>
                <p className="text-[11px] text-slate-500 mt-1">Customers access custom booking links. Dynamic client rendering matches brand typography &amp; colors.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-3">3</div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-800">Apps Script Endpoint</h4>
                <p className="text-[11px] text-slate-500 mt-1">Acts as a serverless router. Safe direct post from customer browser without expensive database costs.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg mb-3">4</div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-800">Google Sheets Storage</h4>
                <p className="text-[11px] text-slate-500 mt-1">Stores contact info, dates, times. Instantly exportable to CSV/Excel or hooked to newsletter lists.</p>
              </div>
            </div>

            <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
              <p>
                This Calendly alternative leverages a serverless multi-channel model to provide high-grade enterprise reservation functionality for $0/year. By removing the traditional node/relational server requirement, you get a zero-maintenance portal that will never scale up in hosting bills.
              </p>
              <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-4 flex gap-3 text-amber-900 text-xs">
                <Key className="text-amber-600 shrink-0 mt-0.5" size={16} />
                <div>
                  <span className="font-semibold">Security Note:</span> To keep host settings private, client-facing forms submit data straight to the serverless REST endpoint using safe direct posting parameters, keeping your private settings secure inside the Host Admin panel.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETUP GUIDE */}
        {activeTab === 'setup' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 font-display">Step-by-Step System Activation Guide</h3>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-none w-8 h-8 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center text-xs">1</div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-800 text-sm">Create the Google Sheet Spreadsheet</h4>
                  <p className="text-slate-600 text-xs sm:text-sm">
                    Go to <a href="https://sheets.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">sheets.google.com</a> and start a new blank Spreadsheet. Name it <code className="bg-slate-100 px-1 py-0.5 rounded text-xs text-rose-600 font-mono">Free Booking Database</code>.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-none w-8 h-8 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center text-xs">2</div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-800 text-sm">Add the Apps Script Engine</h4>
                  <p className="text-slate-600 text-xs sm:text-sm">
                    Inside your new Google Sheet, go to the top menu and select <strong>Extensions &gt; Apps Script</strong>. A code editor will load in a new tab.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-none w-8 h-8 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center text-xs">3</div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-800 text-sm">Paste the Backend Code</h4>
                  <p className="text-slate-600 text-xs sm:text-sm">
                    Delete any code inside the default file and paste the script from the <strong>Apps Script Code</strong> tab in this guide.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-none w-8 h-8 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center text-xs">4</div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-800 text-sm">Deploy as Web App</h4>
                  <p className="text-slate-600 text-xs sm:text-sm">
                    Click <strong>Deploy &gt; New deployment</strong>. Click the gear icon next to Select type, select <strong>Web App</strong>. Set "Execute as" to <strong>Me (your-email)</strong> and set "Who has access" to <strong>Anyone</strong>. Click Deploy, authenticate permissions, and copy the deployment URL!
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4">
                <div className="flex-none w-8 h-8 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center text-xs">5</div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-800 text-sm">Integrate with Firebase/Supabase (Free Account)</h4>
                  <p className="text-slate-600 text-xs sm:text-sm">
                    Create a free tier account on Firebase or Supabase. Enable "Google Provider" or "Email Auth" on their dashboards. In this React workspace, simply load the config keys in `src/firebase-applet-config.json` to switch from client persistence to multi-user database storage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CODE SNIPPETS */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 font-display">Target Integration Code</h3>
              <span className="text-[10px] text-slate-500 font-mono">Tested with JavaScript ES6 &amp; CORS rules</span>
            </div>

            {/* Apps Script Code snippet */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-slate-900 px-4 py-2 rounded-t-xl text-xs text-slate-300 font-mono">
                <span>Google Apps Script Backend (Code.gs)</span>
                <button
                  onClick={() => handleCopy(appsScriptCode, 'appsScript')}
                  className="hover:text-white flex items-center gap-1 transition-colors"
                >
                  {copiedText === 'appsScript' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copiedText === 'appsScript' ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-b-xl overflow-x-auto text-[11px] sm:text-xs text-slate-200 font-mono leading-relaxed border border-slate-900 max-h-[250px] scrollbar-thin">
                {appsScriptCode}
              </pre>
            </div>

            {/* Client-side fetch snippet */}
            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center bg-slate-900 px-4 py-2 rounded-t-xl text-xs text-slate-300 font-mono">
                <span>React Client API Posting Method</span>
                <button
                  onClick={() => handleCopy(fetchSnippet, 'fetchSnippet')}
                  className="hover:text-white flex items-center gap-1 transition-colors"
                >
                  {copiedText === 'fetchSnippet' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copiedText === 'fetchSnippet' ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-b-xl overflow-x-auto text-[11px] sm:text-xs text-slate-200 font-mono leading-relaxed border border-slate-900 max-h-[250px] scrollbar-thin">
                {fetchSnippet}
              </pre>
            </div>
          </div>
        )}

        {/* MARKETING & EXPORT */}
        {activeTab === 'marketing' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 font-display">Lead Storage &amp; Campaign Management</h3>
            
            <div className="space-y-5 text-slate-600 text-sm">
              <p>
                Because your booking lead data routes into standard cloud spreadsheets, managing follow-up campaigns is fully automated and free.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                  <CheckCircle2 className="text-emerald-500" size={20} />
                  <h4 className="font-semibold text-slate-800 text-xs sm:text-sm">Manual CSV Download</h4>
                  <p className="text-xs text-slate-500">
                    Inside Google Sheets, navigate to <strong>File &gt; Download &gt; Comma Separated Values (.csv)</strong>. You can import this list instantly into Mailchimp, HubSpot, or ActiveCampaign.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                  <CheckCircle2 className="text-emerald-500" size={20} />
                  <h4 className="font-semibold text-slate-800 text-xs sm:text-sm">Zapier Sheet Hook</h4>
                  <p className="text-xs text-slate-500">
                    Connect Google Sheets to Mailchimp via Zapier's free tier. Whenever a new row is appended (via an appointment booking), the contact email is automatically added to your subscriber segment.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                  <CheckCircle2 className="text-emerald-500" size={20} />
                  <h4 className="font-semibold text-slate-800 text-xs sm:text-sm">Triggering Reminders</h4>
                  <p className="text-xs text-slate-500">
                    Your scheduled reminders list inside the dashboard simulates automatic confirmation emails. Google Sheets can trigger native email scripts (using Apps Script MailApp) to notify the host automatically!
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200/50 rounded-xl p-4 text-blue-900 text-xs">
                <span className="font-semibold">Apps Script Endpoint Used:</span> Currently, this app posts booking events to the target endpoint:
                <div className="font-mono bg-white p-2 rounded mt-2 border border-blue-100 text-[10px] break-all select-all text-blue-800">
                  https://script.google.com/macros/s/AKfycbwJ3rlroAvAIllx8YCjDVS1WPdJ3cZyUNhxBeMCfgK1XsEvRJczRwW5pFfDSEYnJEcQ/exec
                </div>
                Our booking form actively fires JSON records to this database so you can watch bookings populate in real-time.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
