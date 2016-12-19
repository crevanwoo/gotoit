import React, {Component} from 'react';
import _ from 'lodash';

import Layout from './components/Layout';
import './App.css';
import app_state from './AppData';
import WorkerModel from './models/WorkerModel';
import ProjectModel from './models/ProjectModel';
import {skills_names} from './data/knowledge';
import {setCallback} from './services/getData';


var agency_generation_counter = 0;
var contract_generation_counter = 0;

export var hired = 1;
export var projects_done = 0;


class App extends Component {
    constructor(props) {
        super(props);

        this.brutalSet = this.brutalSet.bind(this);
        this.brutalGet = this.brutalGet.bind(this);

        this.getRelation = this.getRelation.bind(this);
        this.modifyRelation = this.modifyRelation.bind(this);
        this.getRole = this.getRole.bind(this);
        this.changeRole = this.changeRole.bind(this);
        this.hireCandidate = this.hireCandidate.bind(this);
        this.rejectCandidate = this.rejectCandidate.bind(this);
        this.agencySearch = this.agencySearch.bind(this);
        this.hireEmployer = this.hireEmployer.bind(this);
        this.dismissEmployer = this.dismissEmployer.bind(this);
        this.contractSearch = this.contractSearch.bind(this);
        this.rejectOffered = this.rejectOffered.bind(this);
        this.startOffered = this.startOffered.bind(this);
        this.startProject = this.startProject.bind(this);
        this.finishProject = this.finishProject.bind(this);
        this.fixProject = this.fixProject.bind(this);
        this.closeProject = this.closeProject.bind(this);
        this.getTechnology = this.getTechnology.bind(this);
        this.changeTechnology = this.changeTechnology.bind(this);

        this.howManyEmployers = this.howManyEmployers.bind(this);


        app_state.data.helpers['brutalSet'] = this.brutalSet;
        app_state.data.helpers['brutalGet'] = this.brutalGet;

        app_state.data.helpers['modifyRelation'] = this.modifyRelation;
        app_state.data.helpers['getRelation'] = this.getRelation;
        app_state.data.helpers['getRole'] = this.getRole;
        app_state.data.helpers['changeRole'] = this.changeRole;
        app_state.data.helpers['hireCandidate'] = this.hireCandidate;
        app_state.data.helpers['rejectCandidate'] = this.rejectCandidate;
        app_state.data.helpers['agencySearch'] = this.agencySearch;
        app_state.data.helpers['hireEmployer'] = this.hireEmployer;
        app_state.data.helpers['dismissEmployer'] = this.dismissEmployer;
        app_state.data.helpers['contractSearch'] = this.contractSearch;
        app_state.data.helpers['rejectOffered'] = this.rejectOffered;
        app_state.data.helpers['startOffered'] = this.startOffered;
        app_state.data.helpers['startProject'] = this.startProject;
        app_state.data.helpers['finishProject'] = this.finishProject;
        app_state.data.helpers['fixProject'] = this.fixProject;
        app_state.data.helpers['closeProject'] = this.closeProject;
        app_state.data.helpers['getTechnology'] = this.getTechnology;
        app_state.data.helpers['changeTechnology'] = this.changeTechnology;

        this.state = app_state;
    }


    brutalGet() {
        return this.state;
    }

    brutalSet(state) {
        this.setState(state);
    }


    getRelation(worker_id, project_id) {
        return (
        worker_id in this.state.data.relations &&
        project_id in this.state.data.relations[worker_id] &&
        this.state.data.relations[worker_id][project_id]);
    }

    modifyRelation(worker_id, project_id, value) {
      //  console.log(worker_id, project_id, value);
        let data = this.state.data;

        let put = (worker_id, project_id) => {
            if (!(worker_id in data.relations)) data.relations[worker_id] = {};
            data.relations[worker_id][project_id] = value;
        };

        if (worker_id === null) {
            this.state.data.workers.forEach((worker) => {
                if (worker.accept_default) put(worker.id, project_id);
            });
        } else if (project_id === null) {
            this.state.data.projects.forEach((project) => {
                if (project.accept_default) put(worker_id, project.id);
            });
        } else {
            put(worker_id, project_id);
        }

        this.setState({data: data});
    }

    getRole(worker_id, role) {
        if (worker_id in this.state.data.workers_roles && role in this.state.data.workers_roles[worker_id])
            return this.state.data.workers_roles[worker_id][role];
    }

    changeRole(worker_id, role, value) {
        let data = this.state.data;
        if (!(worker_id in data.workers_roles))  data.workers_roles[worker_id] = {};
        data.workers_roles[worker_id][role] = value;
        this.setState({data: data});
    }

    agencySearch() {
        agency_generation_counter++;
        let data = this.state.data;
        data.money -= 1000;
        data.candidates.agency.push(WorkerModel.generate(_.random(1, 20) + agency_generation_counter));
        this.setState({data: data});
    }

    hireCandidate(id, type) {
        let data = this.state.data;
        this.hireEmployer((_.remove(data.candidates[type], (candidate) => { return (candidate.id === id); }))[0]);
        this.setState({data: data});
    }

    rejectCandidate(id, type) {
        let data = this.state.data;
        if (type === 'agency') data.money += 900;
        _.remove(data.candidates[type], (candidate) => { return (candidate.id === id); });
        this.setState({data: data});
    }

    hireEmployer(worker) {
        hired++;
        let data = this.state.data;
        worker.facts.tick_hired = data.date.tick;
        data.workers.push(worker);
        this.modifyRelation(worker.id, null, true);
        skills_names.forEach((skill) => { this.changeRole(worker.id, skill, true); });
        this.setState({data: data});
    }

    dismissEmployer(id) {
        hired--;
        let data = this.state.data;
        _.remove(data.workers, (worker) => { return (worker.id === id); });
        this.setState({data: data});
    }


    contractSearch() {
        contract_generation_counter++;
        let data = this.state.data;
        data.money -= 1000;
        data.offered_projects.contract.push(ProjectModel.generate(_.random(1, 20) + contract_generation_counter, 3));
        this.setState({data: data});
    }

    rejectOffered(id, type) {
        let data = this.state.data;
        if (type === 'contract') data.money += 900;
        _.remove(data.offered_projects[type], (candidate) => { return (candidate.id === id); });
        this.setState({data: data});
    }

    startOffered(id, type) {
        let data = this.state.data;
        this.startProject((_.remove(data.offered_projects[type], (candidate) => { return (candidate.id === id); }))[0]);
        this.setState({data: data});
    }

    startProject(project) {
        let data = this.state.data;
        data.projects.push(project);
        this.setState({data: data});
        this.modifyRelation(null, project.id, true);
    }

    closeProject(id) {
        let data = this.state.data;
        this.projectReporting(id, 'close');
        this.setState({data: data});
    }

    failProject(id) {
        let data = this.state.data;
        console.log('fail');
        this.projectReporting(id, 'fail');
        this.setState({data: data});
    }

    fixProject(id) {
        let data = this.state.data;
        _.find(data.projects, (project) => { return (project.id === id); }).fix();
        this.setState({data: data});
    }

    finishProject(id) {
        projects_done++;
        let data = this.state.data;
        data.workers.forEach((worker) => { worker.facts.project_finished++; });
        this.addMoney(_.find(data.projects, (project) => { return (project.id === id); }).reward);
        this.projectReporting(id, 'finish');
        this.setState({data: data});
    }

    projectReporting(project_id, stage) {
        let data = this.state.data;
        let project = _.remove(data.projects, (project) => { return (project.id === project_id); })[0];
        project.stage = stage;
        data.projects_reports.unshift(project);
        this.setState({data: data});
    }

    getTechnology(project_id, technology) {
        return (
        project_id in this.state.data.projects_technologies &&
        technology in this.state.data.projects_technologies[project_id] &&
        this.state.data.projects_technologies[project_id][technology]);
    }

    changeTechnology(technology, project_id, value) {
        let data = this.state.data;
        if (!(project_id in data.projects_technologies)) data.projects_technologies[project_id] = {};
        data.projects_technologies[project_id][technology] = value;
        this.setState({data: data});
    }


    addMoney(quantity) {
        let data = this.state.data;
        data.money += quantity;
        this.setState({data: data});
    }

    chargeMoney(quantity) {
        let data = this.state.data;
        data.money -= quantity;
        this.setState({data: data});
    }


    howManyEmployers() {
        return this.state.data.workers.length;
    }

    componentWillMount(){

        let callback = () => {
            return this.state.data;
        };

        //console.log(callback);
        //console.log(callback());

        setCallback(callback);
    }

    componentDidMount() {
        /*
        let data = this.state.data;
        data.workers = [WorkerModel.generatePlayer()];
        data.workers_roles = {player: {design: true, manage: true, program: true, admin: true}};
        this.setState({data: data});
        */

        this.timerID = setInterval(
            () => this.tick(),
            200
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }


    tick() {
        const data = this.state.data;

        this.nextDay();

        this.rollTurn();

        if (data.date.is_working_time) {
            this.work();
        }

        data.projects.forEach((project) => {
            if (project.tasksQuantity() === 0 && project.bugsQuantity() === 0)
                this.finishProject(project.id);
            project.deadline--;
            if (project.deadline <= 0)
                this.failProject(project.id);
            if (project.tasksQuantity() === 0 && project.bugsQuantity() !== 0)
                this.fixProject(project.id);
        });
    }

    nextDay() {
        let data = this.state.data;
        let time = data.date;

        time.tick++;
        time.hour++; // ; = time.hour
        if (time.hour > 24) {
            time.hour = 1;
            time.day++;
        }
        if (time.day > 7) {
            time.day = 1;
            time.weak++;
        }
        if (time.weak > 4) {
            time.weak = 1;
            time.month++;
        }
        if (time.month > 12) {
            time.month = 1;
            time.year++;
        }

        if (
            time.hour >= 10 &&
            time.hour <= 18 &&
            time.day <= 5
        ) {
            time.is_working_time = true;
            console.log('time to work');
            this.work();
        }
        else {
            time.is_working_time = false;
        }

        data.date = time;
        this.setState({data: data});
    }

    rollTurn() {
        const data = this.state.data;

        if (_.random(1, 24*7) === 1 && data.candidates.resumes.length < 3) {
            data.candidates.resumes.push(WorkerModel.generate(_.random(3, 5)));
        }
        if (_.random(1, 24*7*8) === 1 && data.candidates.resumes.length > 0) {
            _.remove(data.candidates.resumes, (candidate) => { return (candidate.id === data.candidates.resumes[0].id); });
        }

        if (_.random(1, 24*7*4) === 1 && data.candidates.stars.length < 3) {
            data.candidates.stars.push(WorkerModel.generate(_.random(20, 40)));
        }
        if (_.random(1, 24*7*4*8) === 1 && data.candidates.stars.length > 0) {
            _.remove(data.candidates.stars, (candidate) => { return (candidate.id === data.candidates.stars[0].id); });
        }

        if (_.random(1, 24) === 1 && data.offered_projects.freelance.length < 3) {
            data.offered_projects.freelance.push(ProjectModel.generate(_.random(1, 5), _.random(1, 2)));
        }
        if (_.random(1, 24*12) === 1 && data.offered_projects.freelance.length > 0) {
            _.remove(data.offered_projects.freelance, (candidate) => { return (candidate.id === data.offered_projects.freelance[0].id); });
        }

        if (_.random(1, 24*7) === 1 && data.offered_projects.bigdeal.length < 3) {
            data.offered_projects.bigdeal.push(ProjectModel.generate(_.random(20, 40), 4));
        }
        if (_.random(1, 24*7*12) === 1 && data.offered_projects.bigdeal.length > 0) {
            _.remove(data.offered_projects.bigdeal, (candidate) => { return (candidate.id === data.offered_projects.bigdeal[0].id); });
        }

        this.setState({data: data});

    }

    work() {
        const data = this.state.data;
        const tech = data.projects_technologies;
        
        data.workers.forEach((worker) => {
            if (!worker.is_player && (data.money - worker.getSalary()) < 0) return;

            let skip_work = false;

            let worker_roles = {
                design: this.getRole(worker.id, 'design'),
                manage: this.getRole(worker.id, 'manage'),
                program: this.getRole(worker.id, 'program'),
                admin: this.getRole(worker.id, 'admin')};

            // looking worker projects
            let worker_projects = data.projects.filter((project) => {
                return (
                    worker.id in data.relations &&
                    project.id in data.relations[worker.id] &&
                    data.relations[worker.id][project.id] &&
                    project.isNeed(worker_roles));
            });
            // work on one of projects
            if (worker_projects.length > 0) {
                let project = _.sample(worker_projects);

                let salary = worker.getSalary();
                this.chargeMoney(salary);
                worker.facts.money_earned += salary;
                project.facts.money_spent += salary;

                // TDD
                if (project.id in tech && 'tdd' in tech[project.id] && tech[project.id]['tdd'] &&
                    project.tests < project.planedTasksQuantity() &&
                    ((project.tests / project.planedTasksQuantity()) < (project.tasksQuantity() / project.planedTasksQuantity()))  &&
                    _.random(1, 4) === 1) {
                    console.log('writing tests!');
                //    console.log(worker.getSideResource());
                //    console.log(Math.min(project.planedTasksQuantity() - project.tests, worker.getSideResource()));

                    let tests = Math.min(project.planedTasksQuantity() - project.tests, worker.getSideResource());
                    worker.facts.tests_wrote += tests;
                    project.facts.tests_wrote += tests;
                    project.tests += tests;

                    skip_work = true;
                }

                // Refactoring
                if (project.id in tech &&
                    'refactoring' in tech[project.id] &&
                    tech[project.id]['refactoring'] &&
                    project.complexity &&
                    project.complexity < (project.tasksQuantity() + project.bugsQuantity()) && ((
                            _.random(1, project.complexity) >
                            _.random((project.size-1) * Math.sqrt(project.complexity), project.planedTasksQuantity()))
                        )
                    )
                {
                    console.log('refactoring!');
                    let refactoring = Math.min(project.complexity, worker.getSideResource());
                    worker.facts.refactored += refactoring;
                    project.facts.refactored += refactoring;
                    project.complexity -= Math.min(project.complexity, worker.getSideResource());
                    skip_work = true;
                }

                // Work
                if (!skip_work) {
                    let focus_on = (project.id in tech &&
                        'agile' in tech[project.id] &&
                        tech[project.id]['agile'])
                        ? _.maxBy(Object.keys(project.needs), function (o) { return project.needs[o]; }) : null

                    let rad = (project.id in tech &&
                        'rad' in tech[project.id] &&
                        tech[project.id]['rad'])
                        ? true : false;

                    worker.addExperience(project.applyWork(worker.getResources(worker_roles, focus_on), worker, rad));
                }
            }
        });

        /*
        data.projects.forEach((project) => {
            if (project.tasksQuantity() === 0 && project.bugsQuantity() === 0)
                this.finishProject(project.id);
            project.deadline--;
            if (project.deadline <= 0)
                this.failProject(project.id);
            if (project.tasksQuantity() === 0 && project.bugsQuantity() !== 0)
                this.fixProject(project.id);
        });
        */
    }

    render() {
        return (
            <Layout data={this.state.data}/>
        );
    }
}

export default App;
