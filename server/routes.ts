import type { Express } from "express";
import type { Server } from "http";
import { getHelplineInfo } from "./delhi-helplines.js";
import { api } from "@shared/routes";
import { z } from "zod";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Issues
  app.get(api.issues.list.path, async (req, res) => {
    const issues = await storage.getIssues();
    res.json(issues);
  });

  app.post(api.issues.create.path, async (req, res) => {
    try {
      const input = api.issues.create.input.parse(req.body);
      const issue = await storage.createIssue(input);
      res.status(201).json(issue);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input" });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.issues.get.path, async (req, res) => {
    const issue = await storage.getIssue(Number(req.params.id));
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    res.json(issue);
  });

  app.post(api.issues.simulateUpdate.path, async (req, res) => {
    const id = Number(req.params.id);
    const issue = await storage.getIssue(id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    // Cycle through statuses for simulation
    const statuses = ["Reported", "Forwarded", "In Progress", "Resolved"];
    const currentIndex = statuses.indexOf(issue.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    // Add update history
    const updates = [...(issue.updates || []), { status: nextStatus, date: new Date().toISOString() }];

    const updated = await storage.updateIssueStatus(id, nextStatus, updates);
    res.json(updated);
  });

  app.post(api.issues.simulateDays.path, async (req, res) => {
    const { days } = api.issues.simulateDays.input.parse(req.body);
    await storage.simulateTimePassing(days);
    res.json({ message: `Simulated ${days} days passing.` });
  });

  // Messages
  app.get(api.messages.list.path, async (req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  app.post(api.messages.create.path, async (req, res) => {
    const input = api.messages.create.input.parse(req.body);
    const message = await storage.createMessage(input);
    res.status(201).json(message);
  });

  // Simulated AI Analysis
  app.post(api.analyze.analyzeText.path, async (req, res) => {
    const { text } = req.body;
    const lowerText = text.toLowerCase();

    let category = "General";
    let department = "Delhi Government";
    let importance = "Important for community well-being.";
    let helpline = "1076";
    let actions = ["Provide clear details", "Upload a photo if possible"];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let advice = "Your feedback helps improve our city services.";

    if (lowerText.match(/garbage|waste|trash|dump|smell|dirty|clean/)) {
      category = "Waste";
      const helplineInfo = getHelplineInfo(category);
      department = helplineInfo.authority;
      importance = "Garbage accumulation can spread disease and attract pests.";
      helpline = helplineInfo.helpline;
      actions = ["Avoid the area if possible", "Report to local sanitation", "Take a photo"];
      riskLevel = 'medium';
      advice = "Proper waste management is key to urban hygiene. Avoid physical contact with waste.";
    } else if (lowerText.match(/water|leak|pipe|sewage|flood|supply|drain/)) {
      category = "Water";
      const helplineInfo = getHelplineInfo(category);
      department = helplineInfo.authority;
      importance = "Water leaks waste resources and can cause structural damage.";
      helpline = helplineInfo.helpline;
      actions = ["Close main valve if possible", "Do not drink contaminated water"];
      riskLevel = 'high';
      advice = "Standing water is a breeding ground for mosquitoes. Report leaks immediately to save water.";
    } else if (lowerText.match(/air|smoke|pollution|dust|burn|fumes/)) {
      category = "Air";
      const helplineInfo = getHelplineInfo(category);
      department = helplineInfo.authority;
      importance = "Poor air quality affects respiratory health.";
      helpline = helplineInfo.helpline;
      actions = ["Wear a mask", "Keep windows closed"];
      riskLevel = 'high';
      advice = "High pollution levels detected. Vulnerable groups should stay indoors.";
    } else if (lowerText.match(/road|pothole|traffic|bus|transport|street|signal|light/)) {
      category = "Transport";
      const helplineInfo = getHelplineInfo(category);
      department = helplineInfo.authority;
      importance = "Damaged roads cause accidents and traffic delays.";
      helpline = helplineInfo.helpline;
      actions = ["Drive slowly", "Report exact location"];
      riskLevel = 'medium';
      advice = "Road safety is a shared responsibility. Alert others to the hazard.";
    } else if (lowerText.match(/energy|power|electric|outage|pole|wire|shock/)) {
      category = "Energy";
      const helplineInfo = getHelplineInfo(category);
      department = helplineInfo.authority;
      importance = "Exposed wires or outages can be dangerous.";
      helpline = helplineInfo.helpline;
      actions = ["Stay away from wires", "Report immediately"];
      riskLevel = 'high';
      advice = "Electrical hazards can be fatal. Do not attempt to fix wires yourself.";
    }

    res.json({
      category,
      department,
      importance,
      helpline,
      actions,
      riskLevel,
      advice
    });
  });

  return httpServer;
}
