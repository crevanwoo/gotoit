import React, { PureComponent } from "react";
import Modal from "./Modal/Modal";
import _ from "lodash";

import ReactBootstrapSlider from "react-bootstrap-slider";
import "../../node_modules/react-bootstrap-slider/src/css/bootstrap-slider.min.css";
import { colors } from "../game/knowledge/colors";

import { roles } from "../game/knowledge/workers";
import { skills, skills_names } from "../game/knowledge/skills";
import { DefaultClickSoundButton } from "../game/knowledge/sounds";

class HiringAgency extends PureComponent {
    constructor(props) {
        super(props);
        let min = JSON.parse(JSON.stringify(skills));
        let max = JSON.parse(JSON.stringify(skills));

        _.keys(min).forEach(skill => {
            min[skill] = 1;
        });

        _.keys(max).forEach(skill => {
            max[skill] = 10;
        });

        let state = Object.assign(
            {
                deal_counter: 1,
                min_stats: JSON.parse(JSON.stringify(min)),
                max_stats: JSON.parse(JSON.stringify(max)),
                min_salary: 1,
                max_salary: 100,
                modalOpen: false
            },
            this.props.data.hiring_agency_state,
            { modalOpen: false }
        );

        this.state = state;

        console.log(this.state);
        this.calcCost = this.calcCost.bind(this);
        this.search = this.search.bind(this);
    }

    calcCost() {
        let s = this.state;

        let min_sum_factor = Math.floor(
            _.values(s.min_stats).reduce((sum, val) => {
                return _.sum([sum, Math.pow(val, 2.8)]);
            }, 0)
        );

        let max_sum_factor = Math.floor(
            _.values(s.max_stats).reduce((sum, val) => {
                return _.sum([sum, Math.pow(val, 2.5)]);
            }, 0)
        );

        let pike_factor1 = Math.floor(Math.pow(_.max(_.values(s.min_stats)) + _.max(_.values(s.max_stats)), 2.5));
        let pike_factor2 = Math.floor(Math.pow(_.max(_.values(s.max_stats)) - _.min(_.values(s.max_stats)), 2));

        let min_salary_factor = Math.floor(Math.pow(s.min_salary, 1.95));
        let max_salary_factor = Math.floor(Math.pow(s.max_salary, 1.75));

        let sum_control_factor = 0;

        skills_names.forEach(skill => {
            sum_control_factor += Math.pow(s.max_stats[skill] - s.min_stats[skill], 2);
        });

        sum_control_factor = Math.floor(sum_control_factor);

        let salary_control_factor = Math.pow(s.max_salary - s.min_salary, 2.5) / (201 - s.min_salary - s.max_salary);
        salary_control_factor = Math.floor(salary_control_factor);

        //  console.log(min_sum_factor, max_sum_factor, pike_factor1);
        //  console.log(min_salary_factor, max_salary_factor, sum_control_factor, salary_control_factor, pike_factor2);

        return (
            14 +
            Math.floor(
                ((1 + s.deal_counter / 10) * (1000 + min_sum_factor + max_sum_factor + pike_factor1)) /
                    (0.0006 * (500 + min_salary_factor + max_salary_factor + sum_control_factor + salary_control_factor + pike_factor2))
            )
        );
    }

    search() {
        let state = this.state;
        this.setState({ deal_counter: state.deal_counter++, modalOpen: false });
        this.props.data.helpers.agencySearch(state, this.calcCost());
    }

    openModal() {
        this.setState({ modalOpen: true });
    }

    closeModal() {
        this.setState({ modalOpen: false });
    }

    render() {
        console.log(this.state);

        const data = this.props.data;

        const search_button = (
            <DefaultClickSoundButton
                className="btn btn-md btn-info hidden search"
                style={{ backgroundColor: `${colors.rumor.colorCompleted}` }}
                onClick={() => this.openModal()}
            >
                Search candidate
            </DefaultClickSoundButton>
        );

        const draw_row = (name, child) => {
            return (
                <div key={name} className="row">
                    <div className="col-md-2">{name}</div>
                    <div className="col-md-10 ">
                        <div style={{ padding: "18px" }}>{child}</div>
                    </div>
                </div>
            );
        };

        return (
            <div>
                {search_button}

                {this.state.modalOpen ? (
                    <Modal closeModal={() => this.closeModal()} showCloseButton={true}>
                        <div className="text-center">
                            <h3 className="text-center">Hiring Agency</h3>
                            <p>Choose search criteria. Leave our personnel officers leeway to reduce the cost of the search.</p>
                            {skills_names.map(skill => {
                                return draw_row(
                                    roles[skill].name,
                                    <ReactBootstrapSlider
                                        value={[this.state.min_stats[skill], this.state.max_stats[skill]]}
                                        change={e => {
                                            let state = this.state;
                                            state.min_stats[skill] = e.target.value[0];
                                            state.max_stats[skill] = e.target.value[1];
                                            this.setState(state);
                                        }}
                                        tooltip="always"
                                        step={1}
                                        max={50}
                                        min={1}
                                    />
                                );
                            })}
                            {draw_row(
                                "Salary overrate",
                                <ReactBootstrapSlider
                                    value={[this.state.min_salary, this.state.max_salary]}
                                    change={e => {
                                        let state = this.state;
                                        state.min_salary = e.target.value[0];
                                        state.max_salary = e.target.value[1];
                                        this.setState(state);
                                    }}
                                    tooltip="always"
                                    step={1}
                                    max={100}
                                    min={1}
                                />
                            )}
                            <DefaultClickSoundButton
                                className={this.calcCost() <= data.money ? "btn btn-xs btn-success" : "btn btn-success btn-xs disabled"}
                                onClick={() => {
                                    if (this.calcCost() <= data.money) {
                                        this.search();
                                    }
                                }}
                            >
                                Search {this.calcCost()}
                            </DefaultClickSoundButton>
                        </div>
                    </Modal>
                ) : (
                    ""
                )}
            </div>
        );
    }
}

export default HiringAgency;
