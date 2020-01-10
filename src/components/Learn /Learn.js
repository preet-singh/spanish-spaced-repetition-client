import React, { Component } from 'react';
import UserContext from '../../contexts/UserContext';
import TokenService from '../../services/token-service';
import config from '../../config';
import './Learn.css';

class Learn extends Component {
    state = {
        error: null,
        onResults: false,
        loading: true,
      }
      constructor(props) {
        super(props);
        this.guessInput = React.createRef();
        this.submitForm = this.submitForm.bind(this);
        this.goNext = this.goNext.bind(this);
      }
      static contextType = UserContext
    
      componentDidMount(){
        return fetch(`${config.API_ENDPOINT}/language/head`,
        {headers: {
            'authorization':`bearer ${TokenService.getAuthToken()}`
          }
        })
        .then(res => res.json())
        .then(res => {
          this.context.setNextWord(res);
          this.setState({loading: false});
        })
        .catch(err => this.setState({error: err}));
      }
    
      submitForm(e) {
        e.preventDefault();
    
        if(this.state.onResults){
          this.setState({onResults: !this.state.onResults})
          setTimeout(() => document.getElementById('learn-guess-input').focus(), 250);
        } else {
        this.context.setCurrWord(this.context.nextWord)
        this.context.setGuess(e.target.userinput.value)
        this.setState({onResults: !this.state.onResults, loading: true})
    
        fetch(`${config.API_ENDPOINT}/language/guess`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'authorization':`bearer ${TokenService.getAuthToken()}`,
            'Accept': 'application/json',
          },
          body: JSON.stringify({guess: e.target.userinput.value})
        })
          .then(res => res.json())
          .then(json => {
            this.context.setNextWord(json);
            this.showFeedback();
            document.getElementById('feedback-overlay').focus();
            this.setState({loading: false});
            document.getElementById('learn-guess-input').value = '';
          });
        }
      }
    
      showFeedback() {
        const el = document.getElementById('feedback-overlay');
        el.classList.remove('invisible');
        setTimeout(() => {el.classList.add('invisible')}, 2500);
      }
    
      clearFeedback() {
        document.getElementById('feedback-overlay').classList.add('invisible');
        document.getElementsByClassName('btn')[0].focus();
      }
    
      getResponseText() {
        if(this.context.nextWord)
         if(typeof this.context.nextWord.isCorrect !== 'undefined') {
          if(this.context.nextWord.isCorrect) {
            return 'You were correct! :D';
          } else {
            return 'Good try, but not quite right :(';
          }
        }
      }
    
      getResponseFeedback(){
        if(this.context.nextWord && typeof this.context.nextWord.isCorrect !== 'undefined'){
            return `The correct translation for ${this.context.currWord.nextWord} was ${this.context.nextWord.answer} and you chose ${this.context.guess}!`
        }
      }
    
      generateCurrentWord(){
        if(this.state.onResults){
          return this.context.currWord.nextWord
        } else {
          return this.context.nextWord ? this.context.nextWord.nextWord : null
        }
      }
    
      generateButton(){
        if(this.state.onResults){
          return <button onClick={() => this.moveToNextWord}>{this.getButtonText()}</button>
        } else{
          return <button type="submit">{this.getButtonText()}</button>
        }
      }
    
      getButtonText(){
        if(this.state.onResults){
          return 'Try another word!'
        } else return 'Submit your answer';
      }
    
      setRequired() {
        if(this.state.onResults){
          return null
        } else{
          return 'required'
        }
      }
    
      goNext(e) {
        if(e.key === 'Enter' || e.key === ' ') {
          this.clearFeedback();
        }
      }
    render(){
        return (
            <div className="learn-page">
                <h2>Translate the word:</h2><span>{this.context.nextWord ?  this.state.onResults ? this.context.currWord.nextWord : this.context.nextWord.nextWord : null}</span>
                <h3 id="feedback-overlay" tabIndex="0" onKeyPress={this.goNext} className="invisible" onClick={this.clearFeedback} aria-live="polite">{this.getResponseText()}</h3>
                <div className="DisplayScore">
                    <p>Your total score is: {this.context.nextWord ? this.context.nextWord.totalScore : null}</p>
                </div>
                <div className="DisplayFeedback">
                    <p className={this.state.onResults ? '' : 'hidden'}>{this.getResponseFeedback()}</p>
                </div>
                <form onSubmit={this.submitForm}>
                    <label htmlFor="learn-guess-input" className={this.state.onResults ? 'hidden' : ''}>What's the translation for this word?</label>
                    <input autoFocus={true} id="learn-guess-input" name="userinput" type="text" required={this.state.onResults ? false : true} className={this.state.onResults ? 'hidden' : ''} maxLength="25"></input>
                    <button className="btn" type="submit">{this.getButtonText()}</button>
                </form>
                <p className="word-count">You have answered this word correctly {this.state.onResults ? this.context.currWord.wordCorrectCount : null} times.</p>
                <p className="word-count">You have answered this word incorrectly {this.state.onResults ? this.context.currWord.wordIncorrectCount : null} times.</p>
            </div>
        )
    }
}
export default Learn;

// note-to-self - took this out of lines 145/146 before : null , where this now updates the score only when a guess has been submitted
//: this.context.nextWord ? this.context.nextWord.wordCorrectCount 
//: this.context.nextWord ? this.context.nextWord.wordIncorrectCount 