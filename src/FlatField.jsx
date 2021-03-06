import _ from 'underscore'
import React from 'react'
import { FormControl, FormGroup, ControlLabel } from 'react-bootstrap'
import validators from './validators.js'
import DefaultTextInput from './input-components/DefaultTextInput.jsx'

const flatTypes = [
  React.PropTypes.string,
  React.PropTypes.number,
  React.PropTypes.boolean
];

const FlatField = React.createClass({
  propTypes: {
    // text or select
    type: React.PropTypes.string,
    formGenerator: React.PropTypes.object.isRequired,
    label: React.PropTypes.oneOfType(flatTypes),
    placeholder: React.PropTypes.oneOfType(flatTypes),
    enum: React.PropTypes.array,
    defaultValue: React.PropTypes.any,
    validators: React.PropTypes.arrayOf(React.PropTypes.func),
    onChange: React.PropTypes.func,
    isRequired: React.PropTypes.bool,
    isNumerical: React.PropTypes.bool,
    isPassword: React.PropTypes.bool,
    validateOnSubmit: React.PropTypes.bool,
    id: React.PropTypes.number
  },

  getDefaultProps: function() {
    return {
      type: 'text',
      label: '',
      placeholder: '',
      enum: [],
      validators: [],
      onChange: function() {},
      defaultValue: '',
      isRequired: false,
      isNumerical: false,
      id: 0
    };
  },

  getInitialState: function() {
    return {
      value: this.props.defaultValue || '',
      errorMessages: []
    };
  },

  componentDidMount: function() {
    const errorMessages = this.props.validateOnSubmit
      ? []
      : this.validate(this.getValue());

    this.setState({
      errorMessages: errorMessages
    });
    this.props.onChange();
  },

  validate: function(value) {
    let validatorFuncs = this.props.validators;
    // If required, add the nonEmpty validator
    validatorFuncs = this.props.isRequired
      ? validatorFuncs.concat([validators.nonEmpty()])
      : validatorFuncs;

    // If type Number, add the number validator
    validatorFuncs = this.props.isNumerical
      ? validatorFuncs.concat([validators.number()])
      : validatorFuncs;

    return _.compact(
      _.map(validatorFuncs, function(validate) {
        return validate(value);
      })
    );
  },

  isValid: function() {
    return !this.validate(this.getValue()).length;
  },

  showErrorMessages: function() {
    this.setState({
      errorMessages: this.validate(this.getValue())
    });
  },

  getValue: function() {
    return this.state.value;
  },

  setValue: function(newValue) {
    const errorMessages = this.props.validateOnSubmit
      ? []
      : this.validate(this.getValue());

    this.setState({
      value: newValue,
      errorMessages: errorMessages
    }, this.props.onChange);
  },

  reset: function() {
    this.setValue(this.props.defaultValue);
  },

  onChange: function(e) {
    // If checkbox type, toggle value;
    // otherwise, use the event target value
    const newValue = this.props.type === 'checkbox'
      ? !this.state.value
      : e.target.value;

    this.setValue(newValue);
  },

  render: function() {
    const inputs = this.props.formGenerator.inputs;
    const TextInput = inputs.TextInput;
    const BoolInput = inputs.BoolInput;
    const EnumInput = inputs.EnumInput;

    return (function(that) {
      switch (that.props.type) {
        case 'text':
        case 'password': return (
          <TextInput
            type={that.props.type}
            errors={that.state.errorMessages}
            label={that.props.label}
            placeholder={that.props.placeholder}
            value={that.state.value}
            onChange={that.onChange}
            key={that.props.id}
            id={that.props.id}/>
        );
        case 'checkbox': return (
          <BoolInput
            errors={that.state.errorMessages}
            label={that.props.label}
            placeholder={that.props.placeholder}
            onChange={that.onChange}
            value={that.getValue()}
            key={that.props.id}
            id={that.props.id}/>
        );
        case 'select':
        return (
          <EnumInput
            enum={that.props.enum}
            errors={that.state.errorMessages}
            label={that.props.label}
            placeholder={that.props.placeholder}
            onChange={that.onChange}
            value={that.state.value}
            key={that.props.id}
            id={that.props.id}/>
        );
        case 'hidden': return <span key={that.props.id}/>;
        case 'date': throw 'Unimplemented';
        default: throw 'Unimplemented';
      }
    })(this);
  }
});

export default FlatField
