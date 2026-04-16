import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { consensusGradient } from '../data/generated_samples'
import './CrossoverChart.css'

function CrossoverChart({ currentConsensus, currentOutput }) {
  const svgRef = useRef()

  useEffect(() => {
    const width = 900
    const height = 400
    const margin = { top: 40, right: 60, bottom: 60, left: 80 }

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')

    const xScale = d3.scaleLinear()
      .domain([0, 7])
      .range([margin.left, width - margin.right])

    const yScaleMLP = d3.scaleLinear()
      .domain([0, 200])
      .range([height - margin.bottom, margin.top])

    const yScaleFireRate = d3.scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top])

    // Grid lines
    svg.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yScaleMLP.ticks(5))
      .join('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', d => yScaleMLP(d))
      .attr('y2', d => yScaleMLP(d))
      .attr('stroke', '#e5e5e5')
      .attr('stroke-dasharray', '2,2')

    // X axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(7).tickFormat(d => d.toFixed(0)))
      .call(g => g.select('.domain').attr('stroke', '#94a3b8'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#94a3b8'))
      .call(g => g.selectAll('.tick text').attr('fill', '#64748b').attr('font-size', '13px'))

    svg.append('text')
      .attr('x', (width - margin.left - margin.right) / 2 + margin.left)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#475569')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .text('Consensus Count (0 = no agreement, 7 = all agree)')

    // Y axis (MLP output)
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScaleMLP).ticks(5))
      .call(g => g.select('.domain').attr('stroke', '#2563eb'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#2563eb'))
      .call(g => g.selectAll('.tick text').attr('fill', '#2563eb').attr('font-size', '13px'))

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(height - margin.top - margin.bottom) / 2 - margin.top)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#2563eb')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .text('MLP Output Magnitude')

    // Y axis (N2123 fire rate)
    svg.append('g')
      .attr('transform', `translate(${width - margin.right},0)`)
      .call(d3.axisRight(yScaleFireRate).ticks(5).tickFormat(d => `${d}%`))
      .call(g => g.select('.domain').attr('stroke', '#ef4444'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#ef4444'))
      .call(g => g.selectAll('.tick text').attr('fill', '#ef4444').attr('font-size', '13px'))

    svg.append('text')
      .attr('transform', 'rotate(90)')
      .attr('x', (height - margin.top - margin.bottom) / 2 + margin.top)
      .attr('y', -(width - margin.right) + 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ef4444')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .text('N2123 Fire Rate (%)')

    // MLP output line
    const mlpLine = d3.line()
      .x(d => xScale(d.consensusCount))
      .y(d => yScaleMLP(d.mlpOutput))
      .curve(d3.curveMonotoneX)

    svg.append('path')
      .datum(consensusGradient)
      .attr('fill', 'none')
      .attr('stroke', '#2563eb')
      .attr('stroke-width', 3)
      .attr('d', mlpLine)

    // N2123 fire rate line
    const fireRateLine = d3.line()
      .x(d => xScale(d.consensusCount))
      .y(d => yScaleFireRate(d.n2123FireRate))
      .curve(d3.curveMonotoneX)

    svg.append('path')
      .datum(consensusGradient)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 3)
      .attr('d', fireRateLine)

    // Data points
    svg.selectAll('.mlp-point')
      .data(consensusGradient)
      .join('circle')
      .attr('class', 'mlp-point')
      .attr('cx', d => xScale(d.consensusCount))
      .attr('cy', d => yScaleMLP(d.mlpOutput))
      .attr('r', 5)
      .attr('fill', '#2563eb')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)

    svg.selectAll('.fire-point')
      .data(consensusGradient)
      .join('circle')
      .attr('class', 'fire-point')
      .attr('cx', d => xScale(d.consensusCount))
      .attr('cy', d => yScaleFireRate(d.n2123FireRate))
      .attr('r', 5)
      .attr('fill', '#ef4444')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)

    // Current position marker
    if (currentConsensus !== null) {
      const x = xScale(currentConsensus)
      const yMLP = yScaleMLP(currentOutput)

      // Vertical line
      svg.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', margin.top)
        .attr('y2', height - margin.bottom)
        .attr('stroke', '#16a34a')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')

      // Current point marker
      svg.append('circle')
        .attr('cx', x)
        .attr('cy', yMLP)
        .attr('r', 8)
        .attr('fill', '#16a34a')
        .attr('stroke', 'white')
        .attr('stroke-width', 3)

      // Label
      svg.append('text')
        .attr('x', x)
        .attr('y', margin.top - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#16a34a')
        .attr('font-size', '13px')
        .attr('font-weight', '600')
        .text('← Current token')
    }

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1e293b')
      .attr('font-size', '16px')
      .attr('font-weight', '600')
      .text('The Consensus Gradient: More Agreement = Less Work')

  }, [currentConsensus, currentOutput])

  return (
    <div className="crossover-chart">
      <svg ref={svgRef}></svg>
      <div className="chart-explanation">
        <h4>The Key Finding</h4>
        <p>
          As consensus increases (more neurons agree), two things happen:
        </p>
        <ul>
          <li>
            <span className="blue-dot"></span>
            <strong>MLP output magnitude decreases</strong> — the correction needed shrinks
          </li>
          <li>
            <span className="red-dot"></span>
            <strong>N2123 fire rate drops</strong> — the exception handler stays silent
          </li>
        </ul>
        <p className="punchline">
          At <strong>7/7 consensus</strong>, the MLP barely helps (output = 74.6).
          The token is already predictable from context — the nonlinearity is wasted.
        </p>
      </div>
    </div>
  )
}

export default CrossoverChart
