# PROJECT DOCUMENTATION & TECHNICAL REPORT
## **AI Business Advisor: Intelligent Enterprise Analytics Using Machine Learning**

---

### **1. Executive Summary & Abstract**
The **AI Business Advisor** is an end-to-end full-stack Enterprise Business Intelligence (BI) and Automated Machine Learning (AutoML) platform. It enables non-technical business users, decision-makers, and analysts to upload raw datasets (in CSV or Excel formats) and immediately derive strategic intelligence. 

The system automatically profiles data quality, identifies anomalies and statistical outliers, generates interactive visual charts and correlation matrices, trains custom **XGBoost** estimators (Classification, Regression, or Time-Series Forecasting), and features a natural-language conversational AI agent that responds to analytical business inquiries. In addition, it produces comprehensive multi-page executive PDF reports summarizing business health and actionable recommendations.

---

### **2. Problem Statement**
Small-to-medium enterprises and non-technical managers frequently struggle with:
1. **Data Silos & Complexity**: Raw transaction logs and spreadsheet data require dedicated data science personnel to clean, preprocess, and model.
2. **Delayed Decision Making**: Traditional BI suites require complex query languages (SQL/DAX) and manual pipeline authoring.
3. **Lack of Predictive Capabilities**: Most dashboards only display descriptive historical summaries without predictive simulation or scenario forecasting.
4. **Offline & Infrastructure Dependencies**: Many cloud-only enterprise analytics tools cannot run in restricted offline environments or local private networks.

---

### **3. Project Objectives**
* **Automated Data Profiling**: Automatically infer data types (numeric, categorical, datetime), missing values, duplicates, and inter-quartile range (IQR) anomalies upon file upload.
* **Modern Executive Dashboard**: Provide descriptive KPI metrics, funnel distributions, category breakdowns, and dynamic correlation heatmaps.
* **AutoML Engine**: Automatically train, evaluate, and persist machine learning estimators with feature importance rankings and interactive prediction forms.
* **Conversational AI Data Agent**: Allow plain-English business inquiries (e.g., *"Which category generated the highest profit?"*) using Pandas query specifications.
* **Zero-Cost Deployment & Offline Resilience**: Operate fully offline with local file fallback databases, or deploy to zero-cost cloud tiers (Render, Vercel).

---

### **4. System Architecture & Tech Stack**

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT (Frontend)                    │
│      React 19, Vite, Tailwind CSS, Recharts, Lucide    │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (JSON / HTTP)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   SERVER (API Gateway)                 │
│      Node.js, Express, JWT Authentication, Multer      │
│      Fallback File Database / MongoDB Support          │
└───────────────────────────┬────────────────────────────┘
                            │ Internal Microservice Call
                            ▼
┌────────────────────────────────────────────────────────┐
│                   ML SERVICE (Analytics)               │
│    Python 3.13, FastAPI, Pandas, NumPy, XGBoost,       │
│    Scikit-Learn, Statsmodels, Matplotlib, Seaborn      │
└────────────────────────────────────────────────────────┘
```

#### **Technology Stack Details**
* **Frontend**:
  * **Framework**: React 19 (SPA Architecture)
  * **Build Tool**: Vite
  * **Styling**: Tailwind CSS with Glassmorphism UI
  * **Visualization**: Recharts, Framer Motion
  * **Icons**: Lucide React
* **Backend Gateway**:
  * **Runtime**: Node.js v18+ / v22
  * **Framework**: Express.js
  * **Authentication**: JSON Web Tokens (JWT) & bcryptjs
  * **Document Generation**: PDFKit & PDFKit-Table
  * **Data Storage**: Dual-mode (MongoDB with local JSON file fallback)
* **Machine Learning Microservice**:
  * **Framework**: FastAPI (Asynchronous Python API)
  * **Data Engine**: Pandas, NumPy
  * **ML Libraries**: Scikit-Learn, XGBoost
  * **Model Serialization**: Joblib

---

### **5. Key Modules Breakdown**

#### **Module 1: Authentication & Access Control**
* Secure registration and login using salted password hashing (bcrypt).
* Stateless JWT session tokens stored client-side.
* Role-based authorization for administrative diagnostics.

#### **Module 2: Dataset Workspace & Profiler**
* Multi-file drag-and-drop uploader supporting `.csv`, `.xlsx`, and `.xls`.
* Automated schema detection: identifies numerical features, categorical labels, and timestamp columns.
* Statistical integrity scans: calculates missing percentage, duplicate rows, IQR outlier thresholds, and distribution parameters (mean, median, standard deviation).

#### **Module 3: Intelligent Analytics Dashboard**
* **KPI Metrics**: Real-time aggregate volume, transaction yields, and system integrity anomalies.
* **Pipeline Funnel**: Visual representation of conversion and progression percentages.
* **Temporal Trend Chart**: Area charts mapping performance over time.
* **Correlation Matrix Heatmap**: Color-coded matrix (-1.0 to +1.0) displaying inter-variable relationships.
* **Anomalies Table**: Isolation of high-variance rows for audit.

#### **Module 4: Machine Learning Model Studio**
* Autonomous target detection: determines whether the task is **Classification**, **Regression**, or **Time-Series Forecasting**.
* Preprocessing pipeline: automated imputation of missing data, standard feature scaling (`StandardScaler`), and categorical one-hot encoding (`OneHotEncoder`).
* Model evaluation: computes Accuracy, F1-Score, Precision, Recall, MAE, RMSE, and $R^2$ coefficients.
* **Interactive Prediction Simulator**: Generates a dynamic input form for any trained model, enabling users to test "what-if" operational business scenarios in real time.

#### **Module 5: Natural Language Conversational Advisor**
* Translates plain-English user prompts into structured JSON execution queries.
* Executes safe vectorized filtering, aggregation, and grouping operations via Pandas.
* Synthesizes strategic insights and executive recommendations formatted in structured Markdown.

#### **Module 6: Executive PDF Report Center**
* Automatically compiles a publication-ready PDF business briefing.
* Embeds data health audits, variable distribution plots, top revenue drivers, and machine learning model validation scores.

---

### **6. Sample Testing Workflow**
1. **Launch**: Start all services locally using `START-ALL.bat` or navigate to the hosted cloud URL.
2. **Authenticate**: Register a user account and sign in.
3. **Upload Dataset**: Navigate to **Dataset Workspace** and upload `datasets/sample_sales.csv`.
4. **Explore Dashboard**: Review KPI metrics, categorical breakdowns, and the correlation matrix.
5. **Train Estimator**: Open **ML Model Studio**, select `Sales` as the prediction target, and click **Train Model**. Test hypothetical sales using the live prediction form.
6. **Ask Natural Language Questions**: Go to **AI Chat Advisor** and enter:
   > *"Which product category generated the highest sales?"*
7. **Download Executive Report**: Return to **Dataset Workspace** and click **Executive PDF Report** to export the compiled PDF.

---

### **7. Conclusion & Future Scope**
The AI Business Advisor bridges the gap between raw corporate data and executive action. Future enhancements include:
* Integration of real-time streaming data connectors (Kafka, PostgreSQL, Snowflake).
* Native mobile application packaging for Android and iOS using cross-platform wrappers.
* Advanced deep learning models for long-horizon multi-variate forecasting (LSTM/Transformers).
