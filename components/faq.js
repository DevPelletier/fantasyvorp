import React from 'react';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
// import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import Link from 'next/link'

export default function Section() {


    return (
        <section className="copySection">
            <h2>An Introduction to FantasyVORP</h2>
            <h3>What it is and how it works</h3>

            <p>
                <strong>Fantasy:</strong> <br />
                A fantasy (sport) is a type of game, often played using the Internet, where participants assemble imaginary or virtual teams composed of proxies of real players of a professional sport.
            </p>
            <p>
                <strong>'VORP':</strong> <br />
                A fantasy (sport) is a type of game, often played using the Internet, where participants assemble imaginary or virtual teams composed of proxies of real players of a professional sport.
            </p>
            <p>
                <strong>FantasyVORP.com:</strong> <br />
                A website where you can easily find the VORP data for your specific league settings.
            </p>
            <p>That’s it. That’s what this site is for.</p>

            <br /><hr /><br />
            
            <p>
                Alright alright, I can get into the details of it all. The process of building this - even just the process of getting VORP data - is all a bit complicated. But the simplicity of the end result is specifically why I love VORP - it distills all of the stats, categories, points and weights, every position, every average and standard deviation, and the work of trying to compare all of those factors in fantasy sports... into an easy-to-understand (and surprisingly accurate) number - VORP.
            </p>
            <p>
                Luckily, to help you get to the VORP number, or at least to make sense of the impending tsunami of fantasy data coming at you before your draft (and throughout the season), there’s professionals who can help. Each year there’s more analysts and hobbyists alike who create the all-important PROJECTIONS. There’s draft packages, spreadsheets, blog posts, newsletters and more to help you destroy your draft, scour the waiver wire, and be the best fantasy GM you’ve always wanted to be!... but it’s a lot of work. 
            </p>
            <p>
                Every year I find myself spending an equal amount of time researching which analyst’s projections I should listen to, or how to amalgamate a handful of projection sheets into my one perfect projection sheet. It’s a labour of love, to be sure, but… I felt like there should be an easier way. 
            </p>
            <p>
                Not to mention, hopefully you can find the right projections and spreadsheet that’s applicable to <strong>YOUR league settings</strong> - otherwise all of this has been a complete waste of time! If you’re using a Points-only projection for a Banger league, you might as well start reading up on a different sport entirely!
            </p>
            <p>
                The other end of the spectrum would be to simply draft by last seasons’ raw stats in your chosen fantasy app, check out publicly available ADPs, and hope for the best. Sigh. That barely puts you above your friend who “forgot the draft was today” and might ghost the league after week 4.
            </p>
            <p>
                So, that’s where this tool comes in! 
            </p>
            <p>
                Get VORP stats that are accurate to your league settings within seconds, for free.
            </p>
            <p>
                <strong>NOTE: This website is DEFINITELY in beta!</strong> (what’s further back in development than Beta? Alpha?) - and quite rough around the edges, as I am by no means an expert app developer - just a guy who likes to code and analyze data. I rushed over the past few weeks to get this site up before the NHL season starts, of course, so please forgive the mess (and report any bugs you find here - it’d be a huge help!). 
            </p>
            <br /><hr /><br />
            <p>
                How To Use This Site:
            </p>
            <ol>
                <li>
                    <p>Go to the VORP page and input your league settings. </p>
                </li>
                <li>
                    <p>The VORP data is calculated for your league, for the past 3 seasons as well as a weighted average projection for the upcoming 22-23 season.</p>
                    <p>Note: As I said, this site is FIRMLY in beta, and I am by no means an expert app developer, so I have pre-populated this site with a few of the standard settings for fantasy hockey leagues, for common league sizes. If your specific league setting hasn’t been uploaded yet, the dashboard will automatically submit a ticket for your league setting, and give you the option to be notified by email when the data will be available. It’s a bit of a manual process still, so it may take a few hours to appear.</p>
                </li>
            </ol>

            <p>And that’s it!</p>
            <p><strong>TL;DR:</strong><br />
                This is my ‘goldilocks’ fantasy website. Not too complex, not too simple - and useful for ALL fantasy GMs. All you need to know is what the hell a ‘VORP’ is… 😉
            </p>


        <Accordion className="accordion">
            <AccordionSummary
            // expandIcon={<ExpandMoreRoundedIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
                <p><strong>Q:</strong> How do you calculate the projections?</p>
            </AccordionSummary>
            <AccordionDetails>
                <p>
                    <strong>A: </strong>It’s called a <a href="https://www.baseball-reference.com/about/marcels.shtml" target="_blank" rel="noreferrer">"Marcel Projection”</a>, which is supposed to be “the most basic forecasting system you can have, that uses as little intelligence as possible - so basic that Marcel the Monkey could do it”. 

                </p>
                <p>
                    The projection uses 3 years of NHL data, with (1) heavier weighting for more recent seasons, (2) regression towards the mean, and (3) has an age factor. That’s all, folks.
                </p>
                <p>
                    I purposefully try to put as LITTLE subjectivity as possible into these projections, for the simple reason that this tool is supposed to be simple and un-opinionated - just some standard calculations that create a clearer picture of the value of each player for your league, without getting into opinions and assumptions and so on. The only stipulation was to only include players’ seasons with a minimum of 10 GP (the rookie limit is 11 GP, so rookies that played the ‘rookie max’ are included)
                </p>
            </AccordionDetails>
        </Accordion>
        <Accordion className="accordion">
            <AccordionSummary
            // expandIcon={<ExpandMoreRoundedIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
                <p><strong>Q:</strong> How accurate are these projections, then?</p>
            </AccordionSummary>
            <AccordionDetails>
                <p>
                    <strong>A: </strong>Only time will tell! However, after comparing these projections with some of the paid professionals that have released projections in the past few weeks, I can say that there’s not much difference. It’s true, these projections will likely be slightly less accurate than the pros. 
                </p>
                <p>
                    However, I’d argue that the difference is minimal in the grand scheme of things, and that all projections have a margin of error. This Marcel is most definitely in the same ballpark as the majority of pros for most players - if it wasn’t, that would definitely be a red flag! 
                </p>
            </AccordionDetails>
        </Accordion>
        <Accordion className="accordion">
            <AccordionSummary
            // expandIcon={<ExpandMoreRoundedIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
                <p><strong>Q:</strong> What is VORP?</p>
            </AccordionSummary>
            <AccordionDetails>
                <p>
                    <strong>A: </strong>Great question. VORP is a measure of how much a player contributes to your fantasy team in comparison to a replacement-level player. Finding the ‘replacement-level’ depends on how ‘big’ your league is. 
                </p>
                <p>
                    Example: If your league has 12 teams and 20-man rosters, the OVERALL replacement level is the 240th ranked player (12 x 20 = 240). 
                </p>
                <p>
                    A player with 0 VORP is exactly at replacement level - meaning, that player has the minimum fantasy value you could get at that position in your league, before you dip into players that are BELOW replacement-level (meaning there are likely better players available on your waiver wire). (Alternatively, if a player has 0 VORP in a specific category, that means the same thing, but only within that category for that position)
                </p>
                <p>
                    However, calculating “Overall” replacement level doesn’t really make sense in Fantasy, does it? If I can’t put Cale Makar in my C, LW, RW, or G slots in my lineup, then why would I compare him to those positions? Each position in fantasy is a separate group - so each player has a different Value Over Replacement for each position that they are assigned. 
                </p>
                <p>
                    Example 2: Leon Draisaitl is designated (C, LW). In standard leagues, he is probably the most valuable LW (LW-1), but is also probably only the 3rd most valuable C (C-3), behind McDavid and Matthews. His VORP number for C and for LW will be different, because we are only comparing Leon with LWs for his LW VORP, and Cs for his C VORP. This way, you can get a great idea of a players’ ACTUAL value given their positional capabilities. Instead of comparing every position to each other and wondering what the significance of any stat is, the VORP reveals actual, specific value, instantly. The magic of VORP!
                </p>
            </AccordionDetails>
        </Accordion>
        <Accordion className="accordion">
            <AccordionSummary
            // expandIcon={<ExpandMoreRoundedIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
                <p><strong>Q:</strong> Okay, but what really <strong>IS</strong> VORP?! (How is VORP calculated?)</p>
            </AccordionSummary>
            <AccordionDetails>
                <p>
                    <strong>A: </strong>Ah, right. Ok, so VORP is based on Z-scores, which is based on Standard Deviations, which is a mathematical tool that makes it possible to compare and more accurately analyze various large datasets. Essentially, the process is:
                </p>
                <ol>
                    <li>
                        Take your league settings (and league size) to calculate the replacement level and relevant population, as well as relevant categories and point values
                    </li>
                    <li>
                        Separate the population into relevant clusters and calculate Averages and Z-Scores for every category, for every player, for every position.
                    </li>
                    <li>
                        Adjust the Z-scores to the league-specific replacement level (so that “0” VORP is exactly at the replacement level for each category, for each position, and for the league overall.
                    </li>
                </ol>
                <p>
                    If you’re a fantasy nerd like myself, Z-Scores are the holy grail of fantasy sports, and have been for quite some time. VORP is just a way to normalize Z-Scores into a number that is more relevant to the dataset 👌.
                </p>
            </AccordionDetails>
        </Accordion>
        <Accordion className="accordion">
            <AccordionSummary
            // expandIcon={<ExpandMoreRoundedIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
                <p><strong>Q:</strong>  Why is X player ranked so high? Why are Y positions ranked so low? What is this!?</p>
            </AccordionSummary>
            <AccordionDetails>
                <p>
                    <strong>A: </strong>I don’t know, man, I  just crunch the numbers.
                </p>
                <p>
                    In all seriousness, VORP usually reveals a few trends in the rankings that you may not have seen previously. For example, Defence may be much MORE valuable than you thought, Goalies could be much LESS valuable than you thought, and so on. This all depends on your league settings. If you disagree with the projections, that’s fair! Simply take the projections and make your changes as you see fit - that’s the fun part! 
                </p>
            </AccordionDetails>
        </Accordion>
        <Accordion className="accordion">
            <AccordionSummary
            // expandIcon={<ExpandMoreRoundedIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
                <p><strong>Q:</strong> Why doesn’t your site have X feature? Can you add it?</p>
            </AccordionSummary>
            <AccordionDetails>
                <p>
                    <strong>A: </strong>Only time will tell! However, after comparing these projections with some of the paid professionals that have released projections in the past few weeks, I can say that there’s not much difference. It’s true, these projections will likely be slightly less accurate than the pros. 
                </p>
                <p>
                    You’re absolutely right. I ran out of time and I am a slow (and sloppy) coder. Please send me an email with your feature requests - it’d be a huge help to making this site even better! You can also check the <Link href="/changelog">Changelog page</Link> for Upcoming Features in the pipeline, as well as any changes I’ve recently made.
                </p>
            </AccordionDetails>
        </Accordion>
        <Accordion className="accordion">
            <AccordionSummary
            // expandIcon={<ExpandMoreRoundedIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
                <p><strong>Q:</strong> Will this be available for other sports?</p>
            </AccordionSummary>
            <AccordionDetails>
                <p>
                    <strong>A: </strong>Well, VORP is applicable to most fantasy formats, so… hopefully!
                </p>
            </AccordionDetails>
        </Accordion>


        </section>

    )
}