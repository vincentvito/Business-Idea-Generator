import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type {
  ScoreData,
  KeywordMetrics,
  CompetitorAnalysis,
  MoatAnalysis,
  TrendData,
  AmazonProductData,
  LocalCompetitionData,
  KeywordExtractionResult,
} from "@/types/validation";
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
  keywords?: KeywordExtractionResult | null;
  scores?: ScoreData | null;
  metrics?: KeywordMetrics[] | null;
  trends?: TrendData[] | null;
  competitors?: CompetitorAnalysis[] | null;
  moat?: MoatAnalysis | null;
  amazon?: AmazonProductData[] | null;
  localCompetition?: LocalCompetitionData | null;
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
              {scores.ecommerce_score != null && (
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreBig}>{scores.ecommerce_score}</Text>
                  <Text style={styles.scoreLabel}>eCOMMERCE</Text>
                </View>
              )}
              {scores.local_competition_score != null && (
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreBig}>{scores.local_competition_score}</Text>
                  <Text style={styles.scoreLabel}>LOCAL</Text>
                </View>
              )}
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

        {/* Search Trends */}
        {data.trends && data.trends.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Search Trends</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ width: "50%" }}>Keyword</Text>
                <Text style={{ width: "25%", textAlign: "right" }}>Direction</Text>
                <Text style={{ width: "25%", textAlign: "right" }}>YoY Growth</Text>
              </View>
              {data.trends.map((t, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={{ width: "50%" }}>{t.keyword}</Text>
                  <Text
                    style={{
                      width: "25%",
                      textAlign: "right",
                      color:
                        t.trend_direction === "rising"
                          ? "#16a34a"
                          : t.trend_direction === "declining"
                            ? "#dc2626"
                            : "#666",
                    }}
                  >
                    {t.trend_direction.charAt(0).toUpperCase() + t.trend_direction.slice(1)}
                  </Text>
                  <Text style={{ width: "25%", textAlign: "right" }}>
                    {t.growth_percentage > 0 ? "+" : ""}{t.growth_percentage}%
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Amazon Marketplace */}
        {data.amazon && data.amazon.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Amazon Marketplace</Text>
            {(() => {
              const totalProducts = data.amazon.reduce((s, a) => s + a.total_products, 0);
              const avgPrice =
                data.amazon.reduce((s, a) => s + a.avg_price, 0) / data.amazon.length;
              const avgRating =
                data.amazon.reduce((s, a) => s + a.avg_rating, 0) / data.amazon.length;
              const topProducts = data.amazon[0]?.top_products.slice(0, 3) ?? [];
              return (
                <>
                  <View style={{ flexDirection: "row", gap: 24, marginBottom: 8 }}>
                    <View style={styles.row}>
                      <Text style={styles.label}>Total Products:</Text>
                      <Text style={styles.value}>{totalProducts.toLocaleString()}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>Avg Price:</Text>
                      <Text style={styles.value}>${avgPrice.toFixed(0)}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>Avg Rating:</Text>
                      <Text style={styles.value}>{avgRating.toFixed(1)}/5</Text>
                    </View>
                  </View>
                  {topProducts.length > 0 && (
                    <View style={styles.table}>
                      <View style={styles.tableHeader}>
                        <Text style={{ width: "50%" }}>Top Product</Text>
                        <Text style={{ width: "15%", textAlign: "right" }}>Price</Text>
                        <Text style={{ width: "15%", textAlign: "right" }}>Rating</Text>
                        <Text style={{ width: "20%", textAlign: "right" }}>Reviews</Text>
                      </View>
                      {topProducts.map((p, i) => (
                        <View key={i} style={styles.tableRow}>
                          <Text style={{ width: "50%" }}>{p.title.slice(0, 60)}</Text>
                          <Text style={{ width: "15%", textAlign: "right" }}>
                            ${p.price.toFixed(2)}
                          </Text>
                          <Text style={{ width: "15%", textAlign: "right" }}>
                            {p.rating.toFixed(1)}
                          </Text>
                          <Text style={{ width: "20%", textAlign: "right" }}>
                            {p.reviews_count.toLocaleString()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              );
            })()}
          </>
        )}

        {/* Competitive Moat */}
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
            {data.moat.unfair_advantages_to_build.length > 0 && (
              <>
                <Text style={{ fontSize: 9, color: "#666", marginTop: 6 }}>
                  Unfair Advantages to Build:
                </Text>
                {data.moat.unfair_advantages_to_build.map((adv, i) => (
                  <Text key={i} style={styles.bullet}>• {adv}</Text>
                ))}
              </>
            )}
          </>
        )}

        {/* Competitor Analysis */}
        {data.competitors && data.competitors.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Competitor Analysis</Text>
            {data.competitors.slice(0, 5).map((comp, i) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                  <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10 }}>
                    {comp.name}
                  </Text>
                  <Text style={{ fontSize: 8, color: "#666", marginLeft: 8 }}>
                    Authority: {comp.estimated_authority}
                  </Text>
                </View>
                {comp.strengths.length > 0 && (
                  <>
                    <Text style={{ fontSize: 8, color: "#16a34a", marginTop: 2 }}>
                      Strengths:
                    </Text>
                    {comp.strengths.map((s, j) => (
                      <Text key={j} style={{ ...styles.bullet, fontSize: 8 }}>• {s}</Text>
                    ))}
                  </>
                )}
                {comp.weaknesses.length > 0 && (
                  <>
                    <Text style={{ fontSize: 8, color: "#dc2626", marginTop: 2 }}>
                      Weaknesses:
                    </Text>
                    {comp.weaknesses.map((w, j) => (
                      <Text key={j} style={{ ...styles.bullet, fontSize: 8 }}>• {w}</Text>
                    ))}
                  </>
                )}
                <Text style={{ fontSize: 8, color: "#2563eb", marginTop: 2 }}>
                  Opportunity: {comp.differentiation_opportunity}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Local Competition */}
        {data.localCompetition && (
          <>
            <Text style={styles.sectionTitle}>Local Competition (Google Maps)</Text>
            <View style={{ flexDirection: "row", gap: 16, marginBottom: 8 }}>
              <View style={styles.row}>
                <Text style={styles.label}>Total Competitors:</Text>
                <Text style={styles.value}>{data.localCompetition.total_competitors}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Avg Rating:</Text>
                <Text style={styles.value}>
                  {data.localCompetition.avg_rating.toFixed(1)}/5
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Saturation:</Text>
                <Text style={styles.value}>
                  {data.localCompetition.saturation_level}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 8 }}>
              <Text style={{ fontSize: 8, color: "#666" }}>
                Rating Distribution — Excellent: {data.localCompetition.rating_distribution.excellent} | Good: {data.localCompetition.rating_distribution.good} | Average: {data.localCompetition.rating_distribution.average} | Poor: {data.localCompetition.rating_distribution.poor}
              </Text>
            </View>
            {data.localCompetition.top_competitors.length > 0 && (
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={{ width: "35%" }}>Name</Text>
                  <Text style={{ width: "15%", textAlign: "right" }}>Rating</Text>
                  <Text style={{ width: "15%", textAlign: "right" }}>Reviews</Text>
                  <Text style={{ width: "20%" }}>Category</Text>
                  <Text style={{ width: "15%", textAlign: "right" }}>Price</Text>
                </View>
                {data.localCompetition.top_competitors.slice(0, 5).map((c, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={{ width: "35%" }}>{c.name.slice(0, 30)}</Text>
                    <Text style={{ width: "15%", textAlign: "right" }}>
                      {c.rating.toFixed(1)}
                    </Text>
                    <Text style={{ width: "15%", textAlign: "right" }}>
                      {c.reviews_count.toLocaleString()}
                    </Text>
                    <Text style={{ width: "20%" }}>
                      {(c.category ?? "—").slice(0, 18)}
                    </Text>
                    <Text style={{ width: "15%", textAlign: "right" }}>
                      {c.price_level ?? "—"}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        <Text style={styles.footer}>
          Generated by FoodLaunch • {new Date().toLocaleDateString()}
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
          Generated by FoodLaunch • {new Date().toLocaleDateString()}
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
