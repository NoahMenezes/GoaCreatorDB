export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

export async function GET(request: Request) {
  const auth = await requireAdmin(request)
  if (auth instanceof Response) return auth

  const { searchParams } = new URL(request.url)
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')
  const format = (searchParams.get('format') || 'json').toLowerCase().trim()

  const fromDate = fromParam ? new Date(fromParam) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
  const toDate = toParam ? new Date(toParam) : new Date()

  const fromStr = isNaN(fromDate.getTime())
    ? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    : fromDate.toISOString()
  const toStr = isNaN(toDate.getTime()) ? new Date().toISOString() : toDate.toISOString()

  try {
    // 1. Summary KPIs
    const summaryRes = await query(`
      SELECT
        COUNT(*)::int AS total_requests,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::int AS completed_deals,
        COALESCE(
          SUM(CASE WHEN status = 'completed' AND collab_type IN ('paid', 'hybrid') THEN offered_amount ELSE 0 END),
          0
        )::bigint AS offered_amount_of_completed_deals
      FROM collaboration_requests
      WHERE requested_at >= $1 AND requested_at <= $2
    `, [fromStr, toStr])

    // 2. Monthly Request Volume & Completed Deals
    const monthlyRes = await query(`
      SELECT
        to_char(date_trunc('month', requested_at), 'YYYY-MM') AS month,
        COUNT(*)::int AS total_requests,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::int AS completed_deals,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END)::int AS accepted_deals,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END)::int AS rejected_deals,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END)::int AS cancelled_deals,
        COALESCE(
          SUM(CASE WHEN status = 'completed' AND collab_type IN ('paid', 'hybrid') THEN offered_amount ELSE 0 END),
          0
        )::bigint AS offered_amount_of_completed_deals
      FROM collaboration_requests
      WHERE requested_at >= $1 AND requested_at <= $2
      GROUP BY date_trunc('month', requested_at)
      ORDER BY date_trunc('month', requested_at) ASC
    `, [fromStr, toStr])

    // 3. Breakdown by Category (Primary Category)
    const categoryRes = await query(`
      SELECT
        COALESCE(cat.category_name, 'Uncategorized') AS category_name,
        COUNT(cr.request_id)::int AS total_requests,
        COUNT(CASE WHEN cr.status = 'completed' THEN 1 END)::int AS completed_deals,
        COALESCE(
          SUM(CASE WHEN cr.status = 'completed' AND cr.collab_type IN ('paid', 'hybrid') THEN cr.offered_amount ELSE 0 END),
          0
        )::bigint AS offered_amount_of_completed_deals
      FROM collaboration_requests cr
      LEFT JOIN creator_categories cc ON cr.creator_id = cc.creator_id AND cc.is_primary = true
      LEFT JOIN categories cat ON cc.category_id = cat.category_id
      WHERE cr.requested_at >= $1 AND cr.requested_at <= $2
      GROUP BY cat.category_name
      ORDER BY total_requests DESC
    `, [fromStr, toStr])

    // 4. Breakdown by Taluka (Business location)
    const talukaRes = await query(`
      SELECT
        l.taluka,
        l.district,
        COUNT(cr.request_id)::int AS total_requests,
        COUNT(CASE WHEN cr.status = 'completed' THEN 1 END)::int AS completed_deals,
        COALESCE(
          SUM(CASE WHEN cr.status = 'completed' AND cr.collab_type IN ('paid', 'hybrid') THEN cr.offered_amount ELSE 0 END),
          0
        )::bigint AS offered_amount_of_completed_deals
      FROM collaboration_requests cr
      JOIN businesses b ON cr.business_id = b.business_id
      JOIN locations l ON b.location_id = l.location_id
      WHERE cr.requested_at >= $1 AND cr.requested_at <= $2
      GROUP BY l.taluka, l.district
      ORDER BY total_requests DESC
    `, [fromStr, toStr])

    // 5. Breakdown by Collab Type
    const collabTypeRes = await query(`
      SELECT
        collab_type,
        COUNT(*)::int AS total_requests,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::int AS completed_deals,
        COALESCE(
          SUM(CASE WHEN status = 'completed' AND collab_type IN ('paid', 'hybrid') THEN offered_amount ELSE 0 END),
          0
        )::bigint AS offered_amount_of_completed_deals
      FROM collaboration_requests
      WHERE requested_at >= $1 AND requested_at <= $2
      GROUP BY collab_type
      ORDER BY total_requests DESC
    `, [fromStr, toStr])

    // 6. Breakdown by Status
    const statusRes = await query(`
      SELECT
        status,
        COUNT(*)::int AS total_requests,
        ROUND(
          COUNT(*)::numeric * 100.0 / NULLIF((SELECT COUNT(*) FROM collaboration_requests WHERE requested_at >= $1 AND requested_at <= $2), 0),
          2
        ) AS pct
      FROM collaboration_requests
      WHERE requested_at >= $1 AND requested_at <= $2
      GROUP BY status
      ORDER BY total_requests DESC
    `, [fromStr, toStr])

    const summary = summaryRes.rows[0] || {
      total_requests: 0,
      completed_deals: 0,
      offered_amount_of_completed_deals: 0,
    }

    // CSV format export
    if (format === 'csv') {
      const csvLines: string[] = []
      csvLines.push('GoaConnect Admin Reports')
      csvLines.push(`Range,${fromStr.split('T')[0]},to,${toStr.split('T')[0]}`)
      csvLines.push('')

      csvLines.push('SUMMARY METRICS')
      csvLines.push('Total Requests,Completed Deals,Offered Amount of Completed Deals (INR)')
      csvLines.push(`${summary.total_requests},${summary.completed_deals},${summary.offered_amount_of_completed_deals}`)
      csvLines.push('')

      csvLines.push('MONTHLY REQUEST VOLUME & COMPLETED DEALS')
      csvLines.push('Month,Total Requests,Completed Deals,Accepted Deals,Rejected Deals,Cancelled Deals,Offered Amount of Completed Deals (INR)')
      for (const row of monthlyRes.rows) {
        csvLines.push(`${row.month},${row.total_requests},${row.completed_deals},${row.accepted_deals},${row.rejected_deals},${row.cancelled_deals},${row.offered_amount_of_completed_deals}`)
      }
      csvLines.push('')

      csvLines.push('BREAKDOWN BY CATEGORY')
      csvLines.push('Category,Total Requests,Completed Deals,Offered Amount of Completed Deals (INR)')
      for (const row of categoryRes.rows) {
        csvLines.push(`"${row.category_name}",${row.total_requests},${row.completed_deals},${row.offered_amount_of_completed_deals}`)
      }
      csvLines.push('')

      csvLines.push('BREAKDOWN BY TALUKA')
      csvLines.push('Taluka,District,Total Requests,Completed Deals,Offered Amount of Completed Deals (INR)')
      for (const row of talukaRes.rows) {
        csvLines.push(`"${row.taluka}","${row.district}",${row.total_requests},${row.completed_deals},${row.offered_amount_of_completed_deals}`)
      }
      csvLines.push('')

      csvLines.push('BREAKDOWN BY COLLAB TYPE')
      csvLines.push('Collab Type,Total Requests,Completed Deals,Offered Amount of Completed Deals (INR)')
      for (const row of collabTypeRes.rows) {
        csvLines.push(`"${row.collab_type}",${row.total_requests},${row.completed_deals},${row.offered_amount_of_completed_deals}`)
      }
      csvLines.push('')

      csvLines.push('BREAKDOWN BY STATUS')
      csvLines.push('Status,Total Requests,Percentage (%)')
      for (const row of statusRes.rows) {
        csvLines.push(`"${row.status}",${row.total_requests},${row.pct}%`)
      }

      return new Response(csvLines.join('\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="admin-reports.csv"',
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_requests: Number(summary.total_requests) || 0,
          completed_deals: Number(summary.completed_deals) || 0,
          offered_amount_of_completed_deals: Number(summary.offered_amount_of_completed_deals) || 0,
        },
        monthly_velocity: monthlyRes.rows,
        category_breakdown: categoryRes.rows,
        taluka_breakdown: talukaRes.rows,
        collab_type_breakdown: collabTypeRes.rows,
        status_breakdown: statusRes.rows,
      },
    })
  } catch (err) {
    console.error('Failed to generate admin reports:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to generate admin reports' },
      { status: 500 }
    )
  }
}

