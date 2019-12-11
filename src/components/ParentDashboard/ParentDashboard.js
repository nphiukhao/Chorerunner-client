import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import HouseholdContext from '../../contexts/HouseHoldContext'
import ApiService from '../../services/api-service.js'
import AddMembers from '../AddMembers/AddMembers';
import './ParentDashboard.css'


export default class ParentDashboard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      name: '',
      household: [],
      editingHousehold: false,
      editName: false,
      id: null,
      members: {},
      submitFeedback: ''
    }
  }

  static contextType = HouseholdContext;

  componentDidMount() {

    ApiService.getHouseholds()
      .then(res => {
        this.context.setHouseholds(res);
      })
      .catch(error =>
        this.setState({
          error: error,
        })
      )

    ApiService.getMembersAndHouseholds()
      .then(res => {
        this.setState({ members: res });
      })
      .catch(error =>
        this.setState({
          error: error,
        })
      )
  }

  //Boolean check for if there are households
  hasHouseholds = () => this.context.households.length !== 0;

  //Returns appropriate feedback if the user has no households.
  renderUserFeedback() {
    const { households } = this.context;
    if (!this.hasHouseholds()) {
      return (<p>To get started, use the Add Households form to create a household (Maybe you have more than one!).</p>)
    } else {
      return (<p>Add Members to households using the form below, or click on a Household to begin assigning tasks to family members!</p>)
    }
  }

  handleRenderAfterAddMember = res => {
    console.log('THIS IS MEMBERS', this.state.members)
    console.log('this is new member', res)
    if (this.state.members[res.household_id]) {
      let members = this.state.members;
      members[res.household_id].members =
        [...members[res.household_id].members, { 'name': res.name, 'id': res.id }]
      this.setState({
        members: members
      })
    } else {
      let members = this.state.members;
      members[res.household_id] = { 'household_id': res.household_id, 'members': [{ 'name': res.name, 'id': res.id }] }
      this.setState({
        members: members
      })
    }
  }

  onChangeHandle = e => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleHouseholdSubmit = e => {
    e.preventDefault();
    let name = e.target.householdName.value;
    ApiService.postHousehold(name)
      .then(res => {
        //Set form feedback to show successful household add and clear add input.
        this.context.addHousehold(res)
        this.setState({ submitFeedback: `${this.householdName.value} Household Added! Now Add Members!` })
        clearInterval()
        this.householdName.value = '';
        this.render();
      })
      .catch(error => {
        //Set form feedback to error on failure
        this.setState({ submitFeedback: error });
        console.log(error)
      });
  }

  //Toggles whether or not to show the household form.
  toggleEditHousehold = () => {
    this.setState({ editingHousehold: !this.state.editingHousehold })
  }

  //Sets data of household being edited.
  // handleEditHouseholdClick = household => {
  //   console.log('Before: ', this.state.editName, this.state.editId);
  //   this.setState({ editName: household.name, editId: household.id })
  //   console.log('After: ', this.state.editName, this.state.editId);

  //   this.toggleEditHousehold();
  //   this.render();
  // }

  //Clears edit form state
  // clearEditHousehold = () => {
  //   this.setState({ name: '', editName: '', editId: '' })
  // }

  handleEditHouseholdName = householdId => {
    let name = this.state.name;
    let user_id = this.state.user_id

    const newHousehold = {
      id: householdId,
      name,
      user_id
    }

    ApiService.editHouseholdName(householdId, newHousehold)
      .then(res => this.context.setHouseholds(res))
      .catch(this.context.setError)

    this.setState({ editName: false })
  }

  onChangeHandle = e => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  renderHouseholds = () => {
    const { households, deleteHousehold } = this.context;
    return households.map((household) => {
      console.log(household.id)
      if (household.id === this.state.editId) {console.log('It me boo')}
      return (
        <div key={household.id} className="house_card">
          {/*TODO: move textDecoration to css and remove from style*/}
          <Link to={`/household/${household.id}`} style={{ textDecoration: 'none' }}>
            <p >{household.name}</p>
          </Link>
          <Link to={`/household/${household.id}`}>See Dashboard</Link>
          <div className='buttons-container'>
            <button className="delete-household" onClick={event => deleteHousehold(event, household.id)}> Delete </button>
            <button onClick={() => this.setState({ editName: true, id: household.id })}>Edit</button>
            {/* {
              //If editing and this household is the one being edited, render form, otherwise render the button.
              this.state.editingHousehold && household.id === this.state.editId
                ? <EditHouseholdInput
                 household={household}
                 onChangeHandle={this.onChangeHandle}
                 />
                : <EditHouseholdButton
                  household={household}
                  handleEditHouseholdClick={this.handleEditHouseholdClick}
                />
            } */}
          </div>
          {this.state.members && this.state.members[household.id] ?
            <ul>
              {this.state.members[household.id].members.map(member => {
                return <li key={member.id}>{member.name}</li>
              })}
            </ul>
            : <p>
              It looks like this household has no members yet! <a href={'#add-member'}>Add Members</a>.
              </p>}
        </div>
      );
    });
  }

  render() {
    const { households } = this.context;
    return (
      <section className="parent_dashboard">
        <div className="parent_dashboard-feedback">
          <h3>Welcome to ChoreRunner!</h3>
          {this.renderUserFeedback()}
        </div>
        <h2>PARENT DASHBOARD</h2>
        <div className="add-household container">
          <form
            className="add-household-form"
            onSubmit={this.handleHouseholdSubmit}
          >
            <label htmlFor="householdName"> ADD HOUSEHOLD:</label>
            <input name="householdName" type="text" required ref={input => this.householdName = input}></input>
            <button className="submitHH" type="submit">
              Add New Household
            </button>
            {/*Shows success feedback when household submitted successfully*/}
            {!!this.state.submitFeedback
              ? < div className="household-add-form-feedback">
                {this.state.submitFeedback}
              </div>
              : null
            }
          </form>
        </div>
        <div className='household-details container'>
          <AddMembers handleRenderUpdate={this.handleRenderAfterAddMember} />
        </div>
        <div className="household_buttons">
          {this.renderHouseholds()}
          {
            this.state.editName
              ?
              <span>
                <input
                  className="update-household"
                  type="text"
                  name="name"
                  value={households.name}
                  placeholder="name"
                  onChange={this.onChangeHandle}
                />
                <button onClick={() => this.handleEditHouseholdName(this.state.id)}>Save</button>
              </span>
              :
              <span></span>
          }
        </div>
      </section >
    );
  }
}

// //Household edit input takes callback and household as props.
// function EditHouseholdInput(props) {
//   const { household, onChangeHandle, handleEditHouseholdName } = this.props;
//   return (
//     <span>
//       <input
//         className="update-household"
//         type="text"
//         name="name"
//         value={household.name}
//         placeholder="name"
//         onChange={onChangeHandle}
//       />
//       <button onClick={() => handleEditHouseholdName(this.state.editId)}>Save</button>
//     </span>
//   )
// }

// //Household edit button takes callback and household as props
// function EditHouseholdButton() {
//   const { household, handleEditHouseholdClick } = this.props;
//   return (
//     <button
//       onClick={() => handleEditHouseholdClick(household)}>
//       Edit
//     </button>
//   )
// }