# بنية SchoolPulse التجريبية

```text
Static Website (Vercel)
        |
        | POST + X-SchoolPulse-Key
        v
n8n Production Webhook
/schoolpulse-api-v1
        |
        v
SchoolPulse API Engine (Code Node)
        |
        +-- Dashboard
        +-- Incidents + SLA
        +-- Teacher Absence
        +-- Lesson Coverage
        +-- Tasks
        +-- Student Tardiness
        +-- Daily Report
        |
        v
Workflow Static Data
```

## لماذا هذه البنية؟
الهدف الآن تجربة n8n في مشروع مدرسي جديد بدون أي تبعية لأنظمة أخرى.

بعد اعتماد الفكرة يمكن استبدال `Workflow Static Data` بقاعدة PostgreSQL أو Supabase.
