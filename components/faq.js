import React from 'react';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
// import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import Link from 'next/link'

export default function Section() {


    return (
        <section className="faq copySection">
            {/* <div className="faq-nav">
                <Button 
                    href="#"
                    variant="outlined" 
                    >
                    What is VORP?
                </Button>
                <Button 
                    href="#"
                    variant="outlined" 
                    >
                    Why is VORP better?
                </Button>
                <Button 
                    href="#"
                    variant="outlined" 
                    >
                    How do I use this site?
                </Button>
            </div> */}
            <h2>An Introduction to FantasyVORP</h2>
            <p className="headingBg">
                <strong>FantasyVORP.com: Get VORP stats that are accurate to your league settings within seconds.</strong> <br /><br />
                Save time and energy trying to compare fantasy players by comparing a million different raw numbers - use VORP, and get back to winning your league!
            </p>
            <br />
            <hr />
            <br />
            <h3 className="headingBg">
                What is VORP?
            </h3>
            <p><strong>VORP: Value Over Replacement Player</strong><br />
            <em>Def: <strong>A single-number measure of a player&apos;s value, specific to that players&apos; position, and your league settings</strong></em>.</p>
            <p>The stat was first used in the MLB [of course] as a way to measure the effective value of pitcher [<em>e.g.:"How many runs would a replacement level pitcher have allowed here?"</em>].</p>
            <p>In Fantasy Sports, though, there are far less variables to consider, and far more structure. This makes VORP is a <em>much</em> more effective and simple way of measuring player values in Fantasy. However, for some reason VORP hasn&apos;t been adopted by any of the major fantasy platforms - currently, VORP is only really used within some custom spreadsheets found online which may be difficult to find and/or use...</p>
            <p>So that&apos;s why I created this site 🤠</p>
            <h3 className="headingBg">
                Why is VORP better?
            </h3>
            <p><strong>Using VORP is better than your fantasy platform&apos;s existing pre-season / in-season rankings</strong>.</p>
            <p>The standard fantasy platform rankings are not great - and most fantasy GMs know this. That&apos;s why there is an entire cottage industry of <em>custom spreadsheets</em> and <em>insider projections</em>, and so on. Don&apos;t get me wrong - these analysts and spreadsheets are undoubtedly very valuable... for users that want to spend the time and effort to find the right analyst/tool and customize their spreadsheet to perfection.</p>
            <p>
            <strong>But what if we could just use the existing raw stats to create a better ranking system? </strong>
            </p>
            <p>The facts of the case:</p>
            <ul className="withDots">
            <li>
                Standard fantasy platform pre-season rankings are not great. Even the platforms themselves know this - their business is competently facilitating a fantasy league, not performing complex calculations to provide you custom data insights.
            </li>
            <li>
                This lack of effort into data extends to the Regular Season, too, of course. In-season rankings are usually calculated with the most simple possible calculation [averages of each category]. This process works to provide rough estimates of overall value, but <strong>doesn&apos;t take into account several important factors in fantasy</strong>, such as: the value of a category within that players&apos; position, the value of that position relative to other positions, the scarcity of that position&apos;s value, and so much more.
            </li>
            </ul>
            <p><strong>Using VORP solves all of these issues - without increasing complexity. It&apos;s 1 number, and a better ranking.</strong></p>
            <p>You can go as deep as you&apos;d like into the complexity, of course, as well. You can calculate VORP within each category, and even VORP within each category within each position 🤯. But we&apos;re trying to SAVE time and effort here, though, right? So let&apos;s keep it simple - <strong>in fantasy sports, your primary goal is to better understand player values, and VORP makes that easier.</strong> <em>VORP is better</em>.</p>

            <h3 className="headingBg">
                How do I use this site?
            </h3>
            <ol>
                <li>Scroll down 👇 to the <em>Input Your League Settings</em> button - input all of the specific settings for your FHL</li>
                <li>The VORP data for your specific league will be calculated for:
                    <ul>
                    <li>The past 3 seasons</li>
                    <li>A bare-bones VORP projection for the upcoming 22-23 season!</li>
                    <li><em>and coming soon... Live VORP calculations for In-Season and In-Game stats </em>😮</li>
                    </ul>
                </li>
            </ol>
            <p>
            Feel free to play around with the filters above the datatable as well! The Table View is for a Stats vs. Draft data view, filter the table by Position, select your Season [or projection], and switch between Full Season values vs. Per Game values.
            </p>
            <p>
            PS - If you&apos;re interested in that last feature - Live VORP for In-Season and In-Game stats...<br /><Link href="coming-soon">sign up for feature updates here</Link>.
            </p>
            <p><strong>PLEASE NOTE:</strong> This site is FIRMLY IN BETA!!!, and I am by no means an expert app developer, so I have pre-populated this site with a few of the standard settings for fantasy hockey leagues, for common league sizes. If your specific league setting hasn’t been uploaded yet, the dashboard will automatically submit a ticket for your league setting, and give you the option to be notified by email when the data will be available. It’s a bit of a manual process still, so it may take a few hours to appear.</p>            
            <p className="headingBg"><strong>TL;DR:</strong><br />
                This is my ‘goldilocks’ fantasy website. Not too complex, not too simple - and hopefully very useful for all levels of fantasy GM. All you need to know is what the hell a ‘VORP’ is… 🥴
            </p>

            <br /><hr /><br />

            

            <Accordion className="accordion">
            <AccordionSummary
            // expandIcon={<ExpandMoreRoundedIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
                <p><strong>Q: Ok but what <em>IS</em> VORP!? How is it calculated?</strong></p>
            </AccordionSummary>
            <AccordionDetails>
            <p>
                    <strong>A: </strong>Ah, right. Ok, so VORP is based on Z-scores, which is derived from Standard Deviations, which is a mathematical tool that makes it possible to compare and more accurately analyze various large datasets. Easy, right? Ha...</p>
                    <p>Think of all of the player stats within 1 category, let&apos;s take Goals and Centers for this example. <a>1 SD</a> [Standard Deviation] is a standard &apos;slice&apos; of the &apos;# of Goals&apos; within a given group [Centers, in this case]. So let&apos;s say <a>1 SD = 10 goals</a>.</p>
                    <p>This is where <a>Z-Scores</a> come in. A player&apos;s Z-Score is the count of <a>SDs</a> that player is in distance from the <a>average</a> of that category. So let&apos;s say, for # of Goals amongst Centers, the <a>average = 15</a>. PlayerX is a Center that had <strong>25 Goals</strong> last year.</p><p>Therefore, PlayerX has a <a>Z-Score of 1.0 in Goals, amongst Centers</a>; he is +1.0 SD from the average.</p>
                    <p>Essentially, the process is:
                </p>
                <ol>
                    <li>
                        Take your league settings (and league size) to calculate the replacement level and relevant population, as well as relevant categories and point values
                    </li>
                    <li>
                        Separate the population into relevant clusters and calculate Averages, Standard Deviations, and Z-Scores for every category, for every player, for every position.
                    </li>
                    <li>
                        Adjust the Z-scores to the league-specific replacement level (so that “0” VORP is exactly at the replacement level for each category, for each position, and for the league overall.
                    </li>
                </ol>
                <p>
                    If you’re a fantasy nerd like myself, Z-Scores are the holy grail of fantasy sports, and have been for quite some time. VORP is just a way to normalize Z-Scores into a number that is more relevant to the dataset 👌.
                </p>
                {/* <p>
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
                </p> */}
            </AccordionDetails>
        </Accordion>

        <Accordion className="accordion">
            <AccordionSummary
            // expandIcon={<ExpandMoreRoundedIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
                <p><strong>Q: How do you calculate the projections?</strong></p>
            </AccordionSummary>
            <AccordionDetails>
                <p>
                    <strong>A: </strong>It&apos;s called a <a href="https://www.baseball-reference.com/about/marcels.shtml" target="_blank" rel="noreferrer">Marcel Projection</a>, which is supposed to be “the most basic forecasting system you can have, that uses as little intelligence as possible - so basic that Marcel the Monkey could do it”. 

                </p>
                <p>
                    The projection uses 3 years of NHL data, with (1) heavier weighting for more recent seasons, (2) regression towards the mean, and (3) has an age factor. That&apos;s all, folks.
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
                <p><strong>Q: How accurate are these projections, then?</strong></p>
            </AccordionSummary>
            <AccordionDetails>
                <p>
                    <strong>A: </strong>Only time will tell! However, after comparing these projections with some of the paid professionals that have released projections in the past few weeks, I can say that there’s not <em>too</em> much difference. It’s true, these projections will likely be slightly less accurate than the pros. 
                </p>
                <p>
                    However, I’d argue that the difference is minimal, that all projections have SOME margin of error, and should all be taken with a grain of salt. This Marcel is most definitely in the same ballpark as the majority of pros for most players - if it wasn’t, that would definitely be a red flag! 
                </p>
            </AccordionDetails>
        </Accordion>
        <Accordion className="accordion">
            <AccordionSummary
            // expandIcon={<ExpandMoreRoundedIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
                <p><strong>Q: Why is X player ranked so high? Why are Y positions ranked so low? What is this!?</strong></p>
            </AccordionSummary>
            <AccordionDetails>
                <p>
                    <strong>A: </strong>I don’t know, man, I  just crunch the numbers.
                </p>
                <p>
                    In all seriousness, VORP usually reveals a few trends in the rankings that you may not have seen previously. For example, Defence may be much MORE valuable than you thought, Goalies could be much LESS valuable than you thought, and so on. Often, Goalies are less valuable than expected, simply because they apply to fewer categories. However, the PS [Positional Scarcity] column gives context to each position as well, so hopefully that will help you adjust in your drafts.</p>
                    <p>This all depends on your league settings, of course. If you disagree with the projections, that’s fair! Simply take the projections and make your changes as you see fit - that’s the fun part! 
                </p>
            </AccordionDetails>
        </Accordion>
        <Accordion className="accordion">
            <AccordionSummary
            // expandIcon={<ExpandMoreRoundedIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
                <p><strong>Q: Why doesn’t your site have X feature? Can you add it?</strong></p>
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
                <p><strong>Q: Will this be available for other sports?</strong></p>
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