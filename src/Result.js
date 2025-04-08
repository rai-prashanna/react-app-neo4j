
import React from "react";

/* function Result(props) {
  const { results } = props;

  return (
    <div>
      <h2>Results</h2>
      <table>
        <thead>
          <tr>
            <th>DeviceId</th>
            <th>ComponentId</th>
            <th>SubComponentID</th>
          </tr>
        </thead>
{        <tbody>
          {results.map((r, i) => (
            <tr key={i}>
              <td>
                {r.device_serial_number}
              </td>
              <td>{r.component_serial_number}</td>
              <td>{r.subcomponent_serial_number}</td>
            </tr>
          ))}
        </tbody>}
      </table>
    </div>
  );
}

export default Result; */



function Result(props) {
    const { results } = props;
  return (
    <div>
      <h2>Unservice devices, components, sub-components after 2017-01-10</h2>

      <table style={{ fontFamily: 'arial, sans-serif', borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>DeviceId</th>
            <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>ComponentId</th>
            <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>SubComponentID</th>
          </tr>
        </thead>
        {        <tbody>
          {results.map((r, i) => (
            <tr key={i}>
              <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>
                {r.device_serial_number}
              </td>
              <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>{r.component_serial_number}</td>
              <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>{r.subcomponent_serial_number}</td>
            </tr>
          ))}
        </tbody>}
      </table>
    </div>
  );
}

export default Result;
