import React, { useEffect, useState } from 'react';
import "./css/navStyles.css";
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/js/dist/dropdown';
import DropDownItem from "./DropDownItem";





function Nav({ onSubmenuItemClick }) {
        //array of collections for creating list of menus
        const typesOfCollections = ["Players", "Locations", "Items", "Quests", "Actions", "Races", "Professions", "Weather"];



    return (
        <nav className="navbar navbar-inverse fixed-top" id="sidebar-wrapper" role="navigation">
            <ul className="nav sidebar-nav">
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <a href="#admin">Inn Staff</a></div></div>
                {typesOfCollections.map(thing => {
                    return <DropDownItem title={thing} onClick={onSubmenuItemClick} />
                })}
                <li key="Game"><a href="#game">The Game</a></li>
            </ul>
        </nav>
    )
}

export default Nav;