import React, { Component } from 'react';

import ReactBootstrapSlider from 'react-bootstrap-slider';
import '../../../node_modules/react-bootstrap-slider/src/css/bootstrap-slider.min.css';

import _ from 'lodash';

import ProjectModel from '../../models/ProjectModel';

import {
  project_kinds,
  project_platforms
} from '../../game/knowledge/projects';

class StartProject extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selected_workers: {},
      project_name: '',
      project_platform: 'desktop',
      project_kind: 'application'
    };
  }

  componentDidMount() {
    const data = this.props.data;
    const workers = _.map(data.workers, 'id');
    const workers_true = {}; // _.mapValues(workers, () => { return true; });
    _.each(workers, worker_id => {
      workers_true[worker_id] = true;
    });

    console.log(workers, workers_true);
    this.setState({
      selected_workers: workers_true,
      project_name: ProjectModel.genName(),
      project_platform: 'desktop',
      project_kind: 'application'
    });
    console.log('on open');
  }

  render() {
    return (
      <div>
        <h3 className="text-center">Start Project</h3>

        <div className="row filement">
          <div className="slim col-md-12">
            <div
              className="row "
              style={{ justifyContent: 'center', margin: '10px' }}
            >
              <label htmlFor="project-name">
                <h4>{'Project name: '}</h4>
              </label>
              <input
                type="text"
                id="project-name"
                className="form-inline"
                value={this.state.project_name}
                onChange={event => {
                  this.setState({ project_name: event.target.value });
                }}
              />
            </div>
            <div className="row">
              <div className="card text-center col-md-6">
                <h4 className="text-center">Project platform</h4>
                {this.props.data.projects_unlocked_platforms.map(
                  (platform, i) => {
                    return (
                      <div key={i}>
                        <input
                          className="form-check-input"
                          id={platform + '-radio-button'}
                          type="radio"
                          name="platform"
                          value={platform}
                          checked={this.state.project_platform === platform}
                          onChange={e => {
                            this.setState({
                              project_platform: e.target.value
                            });
                          }}
                        />
                        <label
                          style={{ width: '70%', margin: '3px' }} //margin: size(0.5) 0;
                          className="form-check-label btn btn-sm"
                          htmlFor={platform + '-radio-button'}
                        >
                          {platform}
                        </label>
                      </div>
                    );
                  }
                )}
                <p className="filament">
                  {project_platforms[this.state.project_platform].description}
                </p>
              </div>
              <div className="card text-center col-md-6">
                <h4 className="text-center">Project kind</h4>
                {Object.keys(project_kinds).map((kind, i) => {
                  return (
                    <div key={i}>
                      <input
                        className="form-check-input"
                        id={kind + '-radio-button'}
                        type="radio"
                        name="kinds"
                        value={kind}
                        checked={this.state.project_kind === kind}
                        onChange={e => {
                          this.setState({
                            project_kind: e.target.value
                          });
                        }}
                      />
                      <label
                        style={{ width: '70%', margin: '3px' }} //margin: size(0.5) 0;
                        className="form-check-label btn btn-sm"
                        htmlFor={kind + '-radio-button'}
                      >
                        {kind}
                      </label>
                    </div>
                  );
                })}
                <p className="filament">
                  {project_kinds[this.state.project_kind].description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="row filament">
          <div className="col-md-12">
            {this.props.data.workers.map(worker => {
              return (
                <span key={worker.id} style={{ width: '100%' }}>
                  <h4>
                    <input
                      type="checkbox"
                      id={worker.id || 0}
                      checked={this.state.selected_workers[worker.id] || false}
                      onChange={event => {
                        let state = JSON.parse(JSON.stringify(this.state));
                        state.selected_workers[worker.id] =
                          event.target.checked;
                        this.setState(state);
                      }}
                    />{' '}
                    {worker.name}
                  </h4>
                </span>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <button
            className="big btn-success btn-lg"
            onClick={() => {
              this.props.data.helpers.startProject(
                this.state.project_name,
                this.state.selected_workers,
                this.state.project_platform,
                this.state.project_kind
              );
            }}
          >
            Start Project
          </button>
        </div>
      </div>
    );
  }
}

export default StartProject;
