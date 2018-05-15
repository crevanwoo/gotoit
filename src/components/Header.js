import React, { Component } from 'react';
import {FormattedDate} from 'react-intl';
import classNames from 'classnames';

class Header extends Component {
    render() {
        const data = this.props.data;
        const date = this.props.data.date;

        var real_date = new Date();
        var game_date = new Date();
        game_date.setDate(real_date.getDate()+(date.tick/24));

        return (
            <div>
                <div>
                    <span className="flex-container-row" style={{paddingLeft: 20}}>
                        <span className="flex-element">
                            <span onClick={() => {
                                if (data.game_paused) {
                                    data.helpers.playGame();
                                } else {
                                    data.helpers.pauseGame();
                                }
                            }}>
                                <span className={classNames('glyphicon', (data.game_paused ? 'glyphicon-play' : 'glyphicon-pause'))} style={{width: 28, height: 28}}></span>
                            </span>
                            <span onClick={() => {
                                let i = 1;
                                let n = 24;
                                while (i <= n) {
                                    data.helpers.tick((i === n));
                                    i++;
                                }
                            }}>
                                {[1, 3].map((speed, index) => {
                                    return <span key={index}>
                                        {data.game_speed_multiplier === speed
                                            ? <button className="" style={{width: 42, height: 28}}><u>{{0: 'slow',1: 'fast'}[index]}</u></button>
                                            : <button className="" style={{width: 42, height: 28}} onClick={() => {
                                                data.helpers.setGameSpeed(speed); }}>{{0: 'slow',1: 'fast',2: 'faster'}[index]}
                                              </button>}
                                    </span>
                                })}

                                <img src={"24-hours-icon.png"} alt={"Next Day"} title={"Next Day"}
                                     className="img" style={{width: 28, height: 28}}/>
                            </span>
                        </span>
                        <span className="flex-element">
                            <FormattedDate
                                value={game_date}
                                weekday="short"
                                day="numeric"
                                month="short"
                                year="numeric"
                                hour="numeric"
                            />
                        </span>
                        <span className="flex-element flex-container-row" onClick={() => {
                            console.log(data);
                        }}>
                            <span className="flex-element">
                            {(date.is_working_time ?
                                <label className="label-success">Working</label> :
                                (date.day > 5) ?
                                    <label className="label-default">Weekends</label> :
                                    <label className="label-info">Sleeping</label>)}
                            </span>
                            <span className="flex-element">
                                <label onClick={() => {
                                        data.helpers.addMoney(10000, 'usd');
                                        }}>$</label>
                                <span className="font-weight-bold"> {data.money}
                                </span>
                            </span>
                            <span className="flex-element">
                                <span className="font-weight-bold"> {data.btc.toFixed(4)}
                                <label onClick={() => {
                                        data.helpers.addMoney(1, 'btc');
                                        }}> BTC </label>
                                </span>
                            </span>
                        </span>
                        <span className="flex-element">

                        </span>
                    </span>
                </div>
            </div>
        );
    }
}

export default Header;