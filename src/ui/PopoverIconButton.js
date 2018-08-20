/* @flow */

import React, {Component} from 'react';
import IconButton from './IconButton';
import InputPopover from './InputPopover';
import autobind from 'class-autobind';

type Props = {
  iconName: string;
  showPopover: boolean,
  data: Object,
  onTogglePopover: Function,
  onSubmit: Function;
};

export default class PopoverIconButton extends Component {
  props: Props;

  constructor() {
    super(...arguments);
    autobind(this);
    this.buttonRef = React.createRef();
  }

  render() {
    let {onTogglePopover, showPopover, popoverForm, ...props} = this.props; // eslint-disable-line no-unused-vars
    return (
      <IconButton {...props} buttonRef={this.buttonRef} onClick={onTogglePopover}>
        {this._renderPopover()}
      </IconButton>
    );
  }

  _renderPopover() {
    if (!this.props.showPopover) {
      return null;
    }

    return (
      <InputPopover
        // This is part of enabling showing url
        data={this.props.data}
        onSubmit={this._onSubmit}
        onCancel={this._hidePopover}
        popoverForm={this.props.popoverForm}
        buttonNode={this.buttonRef.current}
      />
    );
  }

  _onSubmit() {
    this.props.onSubmit(...arguments);
  }

  _hidePopover() {
    if (this.props.showPopover) {
      this.props.onTogglePopover(...arguments);
    }
  }
}
