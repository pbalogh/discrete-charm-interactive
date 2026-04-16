import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { consensusNeuronInfo } from '../data/generated_samples'
import './ConsensusVoting.css'

function ConsensusVoting({ neurons, consensusCount }) {
  const svgRef = useRef()

  useEffect(() => {
    if (!neurons || neurons.length === 0) return

    const width = 600
    const height = 400
    const margin = { top: 20, right: 20, bottom: 20, left: 120 }

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')

    const barHeight = (height - margin.top - margin.bottom) / neurons.length
    const maxActivation = 1.0

    const xScale = d3.scaleLinear()
      .domain([0, maxActivation])
      .range([margin.left, width - margin.right])

    // Draw bars for each neuron
    neurons.forEach((neuron, i) => {
      const info = consensusNeuronInfo.find(n => n.id === neuron.id)
      const y = margin.top + i * barHeight
      const fires = neuron.fires

      // Background bar
      svg.append('rect')
        .attr('x', margin.left)
        .attr('y', y + barHeight * 0.2)
        .attr('width', xScale(maxActivation) - margin.left)
        .attr('height', barHeight * 0.6)
        .attr('fill', '#e5e5e5')
        .attr('rx', 4)

      // Activation bar
      svg.append('rect')
        .attr('x', margin.left)
        .attr('y', y + barHeight * 0.2)
        .attr('width', 0)
        .attr('height', barHeight * 0.6)
        .attr('fill', fires ? '#22c55e' : '#94a3b8')
        .attr('rx', 4)
        .transition()
        .duration(600)
        .attr('width', xScale(neuron.activation) - margin.left)

      // Neuron label
      svg.append('text')
        .attr('x', margin.left - 10)
        .attr('y', y + barHeight / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '13px')
        .attr('font-weight', fires ? '600' : '400')
        .attr('fill', fires ? '#166534' : '#64748b')
        .text(info ? info.name : `N${neuron.id}`)

      // Role label
      svg.append('text')
        .attr('x', margin.left - 10)
        .attr('y', y + barHeight / 2 + 14)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#94a3b8')
        .text(info ? info.role : '')

      // Activation value
      svg.append('text')
        .attr('x', xScale(neuron.activation) + 5)
        .attr('y', y + barHeight / 2)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', '500')
        .attr('fill', fires ? '#166534' : '#64748b')
        .text(neuron.activation.toFixed(2))
    })

  }, [neurons])

  return (
    <div className="consensus-voting">
      <div className="consensus-count">
        <span className="count">{consensusCount}</span>
        <span className="label">/ 7 neurons agree</span>
      </div>
      <svg ref={svgRef}></svg>
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color firing"></div>
          <span>Firing (activation &gt; 0.1)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color silent"></div>
          <span>Silent</span>
        </div>
      </div>
    </div>
  )
}

export default ConsensusVoting
