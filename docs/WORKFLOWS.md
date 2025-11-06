# Onboarding Workflows

This document defines the detailed workflows for the Smart HR Onboarding Assistant.

## Core Workflows

### 1. New Hire Creation Workflow

**Trigger**: HR submits new hire form

**Inputs**:
- Employee details (name, email, role, department, start date)
- Manager information
- Office location

**Steps**:

```yaml
workflow: create_new_hire
steps:
  1. validate_input:
      - Check required fields
      - Verify email format
      - Validate start date (future date)
      
  2. create_database_record:
      - Generate unique employee ID
      - Save to database
      - Set status: 'pending'
      
  3. trigger_provisioning_workflow:
      - Call account_provisioning workflow
      - Call equipment_request workflow
      - Call training_assignment workflow
      
  4. send_notifications:
      - Email to HR (confirmation)
      - Email to manager (heads up)
      - Slack to IT team (prepare equipment)
      
  5. schedule_reminders:
      - 7 days before: Prepare workspace
      - 1 day before: Send welcome email to new hire
      - Start date: Trigger first day workflow
```

---

### 2. Account Provisioning Workflow

**Trigger**: New hire record created

**Digital Skills Used**:
- Email Account Creator
- Slack Inviter
- Google Workspace Provisioner

**Steps**:

```yaml
workflow: account_provisioning
inputs:
  - employee_id
  - first_name
  - last_name
  - department
  - role

steps:
  1. create_email_account:
      skill: google_workspace.create_user
      params:
        email: "{first_name}.{last_name}@company.com"
        name: "{first_name} {last_name}"
        org_unit: "{department}"
      output: email_created
      
  2. wait_for_email_propagation:
      duration: 30_seconds
      
  3. invite_to_slack:
      skill: slack.send_invite
      params:
        email: "{email_created}"
        channels: ["#general", "#new-hires", "#{department}"]
      output: slack_invited
      
  4. create_github_account:
      condition: role == "Engineer"
      skill: github.invite_to_org
      params:
        email: "{email_created}"
        team: "{department}"
      output: github_invited
      
  5. provision_google_drive:
      skill: google_drive.create_folder
      params:
        name: "{first_name} {last_name}"
        parent: "/Employees"
        share_with: ["{email_created}", "{manager_email}"]
      output: drive_folder_created
      
  6. update_status:
      action: database.update
      params:
        employee_id: "{employee_id}"
        accounts_status: "provisioned"
        
  7. log_completion:
      action: log.info
      message: "Accounts provisioned for {email_created}"
```

---

### 3. Equipment Request Workflow

**Trigger**: New hire record created

**Integrations**: ServiceNow (optional)

**Steps**:

```yaml
workflow: equipment_request
inputs:
  - employee_id
  - role
  - location
  - start_date

steps:
  1. determine_equipment:
      action: ai_decision
      logic: |
        if role in ["Engineer", "Designer"]:
          laptop = "MacBook Pro 16" or "Dell XPS 15"
          monitor = "Dual 27\" 4K"
          accessories = ["Keyboard", "Mouse", "Headset", "Webcam"]
        else:
          laptop = "Standard laptop"
          monitor = "Single 24\""
          accessories = ["Keyboard", "Mouse"]
      output: equipment_list
      
  2. check_inventory:
      skill: servicenow.check_availability
      params:
        items: "{equipment_list}"
        location: "{location}"
      output: availability
      
  3. create_service_request:
      skill: servicenow.create_ticket
      params:
        type: "Equipment Request"
        items: "{equipment_list}"
        recipient: "{employee_name}"
        deliver_by: "{start_date - 3 days}"
        location: "{location}"
      output: ticket_id
      
  4. send_notification:
      skill: slack.send_message
      params:
        channel: "#it-requests"
        message: "🖥️ Equipment request created: {ticket_id}"
        
  5. monitor_fulfillment:
      action: wait_for_webhook
      webhook: "/api/webhooks/servicenow/{ticket_id}"
      timeout: 7_days
      
  6. update_onboarding_status:
      action: database.update
      params:
        employee_id: "{employee_id}"
        equipment_status: "delivered"
```

---

### 4. First Day Workflow

**Trigger**: Start date arrives

**Steps**:

```yaml
workflow: first_day
inputs:
  - employee_id

steps:
  1. send_welcome_email:
      skill: email.send
      params:
        to: "{employee_email}"
        subject: "Welcome to the team! 🎉"
        template: "welcome_email"
        attachments: ["employee_handbook.pdf", "first_day_agenda.pdf"]
        
  2. introduce_ai_assistant:
      skill: slack.send_dm
      params:
        user: "{employee_email}"
        message: |
          Hi {first_name}! 👋
          
          I'm your onboarding assistant. I'm here to help you get settled.
          
          You can ask me questions like:
          - "What's on my schedule today?"
          - "Where do I find the wifi password?"
          - "Who is my buddy?"
          
          Let me know if you need anything!
          
  3. assign_buddy:
      action: ai_match_buddy
      params:
        new_hire_id: "{employee_id}"
        department: "{department}"
        criteria: ["same_team", "similar_role", "high_rating"]
      output: buddy_id
      
  4. send_buddy_notification:
      skill: slack.send_dm
      params:
        user: "{buddy_id}"
        message: |
          You've been matched as a buddy for {employee_name}!
          
          Please reach out and schedule a coffee chat. ☕
          
  5. create_first_day_checklist:
      action: create_tasks
      tasks:
        - name: "Complete IT security training"
          due: "Day 1"
          type: "training"
        - name: "Set up development environment"
          due: "Day 1"
          type: "technical"
          condition: role == "Engineer"
        - name: "Meet with manager"
          due: "Day 1"
          type: "meeting"
        - name: "Team introduction"
          due: "Day 1"
          type: "social"
          
  6. schedule_check_ins:
      action: schedule_recurring
      events:
        - name: "Day 1 check-in"
          time: "4:00 PM"
          attendees: ["{employee_id}", "{manager_id}"]
        - name: "Week 1 check-in"
          time: "Friday 2:00 PM"
        - name: "30-day review"
          time: "30 days from start"
```

---

### 5. AI Assistant Chat Workflow

**Trigger**: New hire sends message

**Steps**:

```yaml
workflow: ai_chat_response
inputs:
  - employee_id
  - message

steps:
  1. understand_intent:
      skill: watsonx.nlp.classify_intent
      params:
        text: "{message}"
      output: intent
      possible_intents:
        - question_about_benefits
        - question_about_schedule
        - question_about_equipment
        - request_help
        - general_query
        
  2. route_to_handler:
      action: switch
      cases:
        - case: intent == "question_about_benefits"
          workflow: answer_benefits_question
        - case: intent == "question_about_schedule"
          workflow: answer_schedule_question
        - case: intent == "question_about_equipment"
          workflow: answer_equipment_question
        - case: intent == "request_help"
          workflow: escalate_to_hr
        - default:
          workflow: general_response
          
  3. log_interaction:
      action: database.insert
      table: chat_history
      data:
        employee_id: "{employee_id}"
        message: "{message}"
        intent: "{intent}"
        response: "{response}"
        timestamp: now()
```

---

### 6. Training Assignment Workflow

**Trigger**: New hire created or role-specific trigger

**Steps**:

```yaml
workflow: assign_training
inputs:
  - employee_id
  - role
  - department

steps:
  1. determine_required_courses:
      action: ai_recommend_courses
      params:
        role: "{role}"
        department: "{department}"
      output: course_list
      
  2. create_learning_path:
      skill: lms.create_path
      params:
        user: "{employee_email}"
        courses: "{course_list}"
        deadline: "30 days"
      output: learning_path_id
      
  3. send_notification:
      skill: email.send
      params:
        to: "{employee_email}"
        subject: "Your learning path is ready"
        body: |
          Hi {first_name},
          
          We've prepared a personalized learning path for you.
          
          Complete these courses in your first 30 days:
          {course_list}
          
          Access your learning portal: {lms_url}
          
  4. schedule_reminders:
      action: schedule_recurring
      reminders:
        - day: 7
          message: "You have {remaining_courses} courses left"
        - day: 14
          message: "Halfway through! Keep it up!"
        - day: 28
          message: "2 days left to complete your training"
```

---

### 7. Escalation Workflow

**Trigger**: AI assistant unable to resolve issue OR task overdue

**Steps**:

```yaml
workflow: escalate_issue
inputs:
  - employee_id
  - issue_type
  - description

steps:
  1. classify_urgency:
      action: ai_classify
      params:
        text: "{description}"
      output: urgency_level
      levels: ["low", "medium", "high", "critical"]
      
  2. assign_to_appropriate_team:
      action: switch
      cases:
        - case: issue_type == "technical"
          assignee: "IT Support"
        - case: issue_type == "hr_policy"
          assignee: "HR Team"
        - case: issue_type == "manager"
          assignee: "{manager_id}"
          
  3. create_ticket:
      skill: servicenow.create_ticket
      params:
        type: "Onboarding Issue"
        priority: "{urgency_level}"
        description: "{description}"
        assigned_to: "{assignee}"
      output: ticket_id
      
  4. notify_stakeholders:
      skill: slack.send_message
      params:
        channel: "{assignee_channel}"
        message: "🚨 Onboarding escalation: {ticket_id}"
        
  5. update_employee:
      skill: slack.send_dm
      params:
        user: "{employee_id}"
        message: |
          I've escalated your issue to {assignee}.
          
          Ticket ID: {ticket_id}
          Expected response: {sla_time}
```

---

## Workflow Monitoring

All workflows emit events for monitoring:

```json
{
  "workflow_id": "account_provisioning_12345",
  "employee_id": "EMP-2024-001",
  "status": "in_progress",
  "current_step": "create_email_account",
  "started_at": "2024-11-06T08:00:00Z",
  "updated_at": "2024-11-06T08:02:30Z",
  "events": [
    {
      "step": "create_email_account",
      "status": "success",
      "duration_ms": 1500,
      "output": "john.doe@company.com"
    }
  ]
}
```

## Error Handling

All workflows implement standard error handling:

1. **Retry Logic**: Automatic retry for transient failures (3 attempts)
2. **Fallback**: Alternative paths when primary fails
3. **Notification**: Alert appropriate team on persistent failures
4. **Rollback**: Undo completed steps if workflow fails midway
