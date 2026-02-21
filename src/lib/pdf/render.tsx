import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { ScoreData, KeywordMetrics, CompetitorAnalysis, MoatAnalysis } from "@/types/validation";
import type { DayZeroPlan } from "@/types/discovery";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10 },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitle: { fontSize: 12, color: "#666", marginBottom: 20 },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: "1 solid #e5e5e5",
  },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 140, color: "#666" },
  value: { flex: 1, fontFamily: "Helvetica-Bold" },
  bullet: { marginBottom: 3, paddingLeft: 12 },
  scoreBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
  },
  scoreItem: { alignItems: "center" },
  scoreBig: { fontSize: 20, fontFamily: "Helvetica-Bold" },
  scoreLabel: { fontSize: 8, color: "#666", marginTop: 2 },
  table: { marginBottom: 12 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 6,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottom: "0.5 solid #e5e5e5",
    fontSize: 9,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#999",
  },
});

interface ValidationPDFData {
  idea?: string;
  scores?: ScoreData | null;
  metrics?: KeywordMetrics[] | null;
  competitors?: CompetitorAnalysis[] | null;
  moat?: MoatAnalysis | null;
}

function ValidationReport({ data }: { data: ValidationPDFData }) {
  const scores = data.scores;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Validation Report</Text>
        <Text style={styles.subtitle}>{data.idea ?? "Business Idea"}</Text>

        {scores && (
          <>
            <View style={styles.scoreBox}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreBig}>{scores.overall_score}</Text>
                <Text style={styles.scoreLabel}>OVERALL</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreBig}>{scores.market_demand_score}</Text>
                <Text style={styles.scoreLabel}>DEMAND</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreBig}>{scores.competition_score}</Text>
                <Text style={styles.scoreLabel}>COMPETITION</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreBig}>{scores.monetization_score}</Text>
                <Text style={styles.scoreLabel}>MONETIZATION</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreBig}>{scores.timing_score}</Text>
                <Text style={styles.scoreLabel}>TIMING</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Verdict:</Text>
              <Text style={styles.value}>{scores.verdict.toUpperCase()}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Summary:</Text>
              <Text style={{ flex: 1 }}>{scores.one_liner}</Text>
            </View>

            <Text style={styles.sectionTitle}>Key Risks</Text>
            {scores.key_risks.map((risk, i) => (
              <Text key={i} style={styles.bullet}>• {risk}</Text>
            ))}

            <Text style={styles.sectionTitle}>Next Steps</Text>
            {scores.next_steps.map((step, i) => (
              <Text key={i} style={styles.bullet}>• {step}</Text>
            ))}
          </>
        )}

        {data.metrics && data.metrics.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Keyword Metrics</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ width: "40%" }}>Keyword</Text>
                <Text style={{ width: "20%", textAlign: "right" }}>Volume</Text>
                <Text style={{ width: "20%", textAlign: "right" }}>Competition</Text>
                <Text style={{ width: "20%", textAlign: "right" }}>CPC</Text>
              </View>
              {data.metrics.slice(0, 15).map((m, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={{ width: "40%" }}>{m.keyword}</Text>
                  <Text style={{ width: "20%", textAlign: "right" }}>
                    {m.avg_monthly_searches.toLocaleString()}
                  </Text>
                  <Text style={{ width: "20%", textAlign: "right" }}>{m.competition}</Text>
                  <Text style={{ width: "20%", textAlign: "right" }}>
                    ${m.high_top_of_page_bid.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {data.moat && (
          <>
            <Text style={styles.sectionTitle}>Competitive Moat</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Competition Level:</Text>
              <Text style={styles.value}>{data.moat.overall_competition_level}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Biggest Gap:</Text>
              <Text style={{ flex: 1 }}>{data.moat.biggest_gap}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Positioning:</Text>
              <Text style={{ flex: 1 }}>{data.moat.recommended_positioning}</Text>
            </View>
          </>
        )}

        <Text style={styles.footer}>
          Generated by Market-Fit Engine • {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
}

function PlanReport({ data }: { data: { plan: DayZeroPlan; idea?: string } }) {
  const { plan, idea } = data;
  const lc = plan.lean_canvas;
  const rm = plan.revenue_model;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Day Zero Plan</Text>
        <Text style={styles.subtitle}>{idea ?? "Business Plan"}</Text>

        <Text style={styles.sectionTitle}>Lean Canvas</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Value Proposition:</Text>
          <Text style={{ flex: 1 }}>{lc.unique_value_proposition}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Unfair Advantage:</Text>
          <Text style={{ flex: 1 }}>{lc.unfair_advantage}</Text>
        </View>

        <Text style={{ ...styles.sectionTitle, fontSize: 11, marginTop: 10 }}>Problems</Text>
        {lc.problem.map((p, i) => (
          <Text key={i} style={styles.bullet}>• {p}</Text>
        ))}

        <Text style={{ ...styles.sectionTitle, fontSize: 11, marginTop: 10 }}>Solutions</Text>
        {lc.solution.map((s, i) => (
          <Text key={i} style={styles.bullet}>• {s}</Text>
        ))}

        <Text style={{ ...styles.sectionTitle, fontSize: 11, marginTop: 10 }}>Customer Segments</Text>
        {lc.customer_segments.map((s, i) => (
          <Text key={i} style={styles.bullet}>• {s}</Text>
        ))}

        <Text style={{ ...styles.sectionTitle, fontSize: 11, marginTop: 10 }}>Channels</Text>
        {lc.channels.map((c, i) => (
          <Text key={i} style={styles.bullet}>• {c}</Text>
        ))}

        <Text style={{ ...styles.sectionTitle, fontSize: 11, marginTop: 10 }}>Key Metrics</Text>
        {lc.key_metrics.map((m, i) => (
          <Text key={i} style={styles.bullet}>• {m}</Text>
        ))}

        <Text style={styles.sectionTitle}>Revenue Model</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Primary Stream:</Text>
          <Text style={{ flex: 1 }}>{rm.primary_stream}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Pricing Strategy:</Text>
          <Text style={{ flex: 1 }}>{rm.pricing_strategy}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Revenue Range:</Text>
          <Text style={styles.value}>{rm.estimated_monthly_revenue_range}</Text>
        </View>
        {rm.secondary_streams.length > 0 && (
          <>
            <Text style={{ fontSize: 9, color: "#666", marginTop: 4 }}>Secondary Streams:</Text>
            {rm.secondary_streams.map((s, i) => (
              <Text key={i} style={styles.bullet}>• {s}</Text>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>30-Day Go-to-Market Roadmap</Text>
        {plan.go_to_market_30_days.map((week) => (
          <View key={week.week} style={{ marginBottom: 10 }}>
            <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 3 }}>
              Week {week.week} — {week.milestone}
            </Text>
            {week.tasks.map((task, i) => (
              <Text key={i} style={styles.bullet}>• {task}</Text>
            ))}
          </View>
        ))}

        <Text style={styles.footer}>
          Generated by Market-Fit Engine • {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
}

export async function renderValidationPDF(data: ValidationPDFData): Promise<Buffer> {
  return renderToBuffer(<ValidationReport data={data} />);
}

export async function renderPlanPDF(data: { plan: DayZeroPlan; idea?: string }): Promise<Buffer> {
  return renderToBuffer(<PlanReport data={data} />);
}
