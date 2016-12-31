import React, { Component } from 'react';
import Portal from 'react-portal';
import _ from 'lodash';

import ReactBootstrapSlider from 'react-bootstrap-slider';

import TeamDialog from './TeamDialog';

import {skills_names, roles, skills} from '../data/knowledge';


class HiringAgency extends Component {
    constructor(props) {
        super(props);

        let min = JSON.parse(JSON.stringify(skills));
        _.keys(min).forEach((skill) => {
            min[skill] = 1;
        });
        let max = JSON.parse(JSON.stringify(skills));
        _.keys(max).forEach((skill) => {
            max[skill] = 10;
        });

        this.state = Object.assign({
            min_stats: JSON.parse(JSON.stringify(min)),
            max_stats: JSON.parse(JSON.stringify(max)),
            min_salary: 25,
            max_salary: 50,
        }, this.props.data.hiring_agency_state);

        this.calcCost = this.calcCost.bind(this);
        this.search = this.search.bind(this);
    }

    calcCost() {
        let s = this.state;

        let min_sum_factor = Math.floor(_.values(s.min_stats).reduce((sum, val) => {
            return _.sum([sum, Math.pow(val, 2.8)]);
        }, 0));
        let max_sum_factor = Math.floor(_.values(s.max_stats).reduce((sum, val) => {
            return _.sum([sum, Math.pow(val, 2.5)]);
        }, 0));

        let pike_factor1 = Math.floor(Math.pow((_.max(_.values(s.min_stats)) + _.max(_.values(s.max_stats))), 2.5));
        let pike_factor2 = Math.floor(Math.pow(_.max(_.values(s.max_stats)) - (_.min(_.values(s.max_stats))), 2));

        let min_salary_factor = Math.floor(Math.pow(s.min_salary, 1.9));
        let max_salary_factor = Math.floor(Math.pow(s.max_salary, 1.7));

        let sum_control_factor = 0;
        skills_names.forEach((skill) => {
            sum_control_factor += Math.pow(s.max_stats[skill] - s.min_stats[skill], 2);
        });
        sum_control_factor = Math.floor(sum_control_factor);

        let salary_control_factor = Math.pow(s.max_salary - s.min_salary, 2.5)
            / (201 - s.min_salary - s.max_salary);
        salary_control_factor = Math.floor(salary_control_factor);

      //  console.log(min_sum_factor, max_sum_factor, pike_factor1);
      //  console.log(min_salary_factor, max_salary_factor, sum_control_factor, salary_control_factor, pike_factor2);

        return Math.floor((1000 + min_sum_factor + max_sum_factor + pike_factor1)
            / (0.0003 * (1000 + min_salary_factor + max_salary_factor + sum_control_factor + salary_control_factor + pike_factor2)));
    }

    search() {
        this.props.data.helpers.agencySearch(this.state, this.calcCost());
        this.refs.agency.closePortal();
    }

    render() {
        const data = this.props.data;

        const search_button = <button className="btn btn-info">Hiring Agency</button>;

        const draw_row = (name, child) => {
            return <div key={name} className="row">
                <div className="col-md-2">{name}</div>
                <div className="col-md-10 ">
                    <div style={{padding: '18px'}}>
                        {child}
                    </div>
                </div>
            </div>
        };

        return (
            <Portal ref="agency" closeOnEsc openByClickOn={search_button}>
                <TeamDialog>
                    <div className="text-center">
                        <h3 className="text-center">Hiring Agency</h3>
                        <p>
                            Choose search criteria. Leave our personnel officers leeway to reduce the cost of the search.
                        </p>
                        {skills_names.map((skill) => {
                            return draw_row(roles[skill].name, <ReactBootstrapSlider
                                        value={[this.state.min_stats[skill], this.state.max_stats[skill]]}
                                        change={(e) => {
                                            let state = this.state;
                                            state.min_stats[skill] = e.target.value[0];
                                            state.max_stats[skill] = e.target.value[1];
                                            this.setState(state);
                                        }}
                                        tooltip='always'
                                        step={1}
                                        max={50}
                                        min={1}/>)
                        })}
                        {draw_row('Salary overrate', <ReactBootstrapSlider
                            value={[this.state.min_salary, this.state.max_salary]}
                            change={(e) => {
                                let state = this.state;
                                state.min_salary = e.target.value[0];
                                state.max_salary = e.target.value[1];
                                this.setState(state);
                            }}
                            tooltip='always'
                            step={1}
                            max={100}
                            min={1}/>)}
                        <button className={this.calcCost() <= data.money ? "btn btn-success" : "btn btn-success disabled"} onClick={() => { if (this.calcCost() <= data.money) { this.search() } }}>Search {this.calcCost()}</button>
                    </div>
                </TeamDialog>
            </Portal>
        );
    }
}

export default HiringAgency;