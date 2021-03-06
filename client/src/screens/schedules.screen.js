import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  FlatList,
  ActivityIndicator,
  Button,
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import { graphql, compose } from 'react-apollo';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';

import { extendAppStyleSheet } from './style-sheet';
import CURRENT_USER_QUERY from '../graphql/current-user.query';

const styles = extendAppStyleSheet({
  scheduleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scheduleName: {
    fontWeight: 'bold',
    flex: 0.7,
  },
  scheduleTextContainer: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 6,
  },
  scheduleText: {
    color: '#8c8c8c',
  },
  scheduleImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  scheduleTitleContainer: {
    flexDirection: 'row',
  },
  scheduleLastUpdated: {
    flex: 0.3,
    color: '#8c8c8c',
    fontSize: 11,
    textAlign: 'right',
  },
  scheduleUsername: {
    paddingVertical: 4,
  }
});

// format createdAt with moment
const formatCreatedAt = createdAt => moment(createdAt).calendar(null, {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  nextWeek: 'dddd',
  lastDay: '[Yesterday]',
  lastWeek: 'dddd',
  sameElse: 'DD/MM/YYYY',
});

const Header = ({ onPress }) => (
  <View style={styles.header}>
    <Button title={'New Schedule'} onPress={onPress} />
  </View>
);
Header.propTypes = {
  onPress: PropTypes.func.isRequired,
};

class Schedule extends Component {
  constructor(props) {
    super(props);

    this.goToSchedule = this.props.goToSchedule.bind(this, this.props.schedule);
  }

  render() {
    const { id, name } = this.props.schedule;
    return (
      <TouchableHighlight
        key={id}
        onPress={this.goToSchedule}
      >
        <View style={styles.scheduleContainer}>
          <Icon name="calendar-check-o" size={24} color={'orange'} />
          <View style={styles.scheduleTextContainer}>
            <View style={styles.scheduleTitleContainer}>
              <Text style={styles.scheduleName}>{`${name}`}</Text>
              <Text style={styles.scheduleLastUpdated}>
              </Text>
            </View>
            <Text style={styles.scheduleUsername}>
            </Text>
            <Text style={styles.scheduleText} numberOfLines={1}>
            </Text>
          </View>
          <Icon
            name="angle-right"
            size={24}
            color={'#8c8c8c'}
          />
        </View>
      </TouchableHighlight>
    );
  }
}

Schedule.propTypes = {
  goToSchedule: PropTypes.func.isRequired,
  schedule: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }),
};

class Schedules extends Component {
  static navigationOptions = {
    title: 'Schedules',
    tabBarIcon: ({ tintColor}) => <Icon size={24} name={'calendar-check-o'} color={tintColor} />
  };

  constructor(props) {
    super(props);
    this.goToSchedule = this.goToSchedule.bind(this);
    this.goToNewSchedule = this.goToNewSchedule.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
  }

  onRefresh() {
    this.props.refetch();
  }

  keyExtractor = item => item.id;

  goToSchedule(schedule) {
    const { navigate } = this.props.navigation;
    navigate('Schedule', { scheduleId: schedule.id, title: schedule.name });
  }

  goToNewSchedule() {
    const { navigate } = this.props.navigation;
    navigate('NewSchedule');
  }

  renderItem = ({ item }) => <Schedule schedule={item} goToSchedule={this.goToSchedule} />;

  render() {
    const { loading, user, networkStatus } = this.props;

    // render loading placeholder while we fetch messages
    if (loading || !user) {
      return (
        <View style={[styles.loading, styles.container]}>
          <ActivityIndicator />
        </View>
      );
    }

    if (user && !user.schedules.length) {
      return (
        <View style={styles.container}>
          <Header onPress={this.goToNewSchedule} />
          <Text style={styles.warning}>{'You do not have any schedules.'}</Text>
        </View>
      );
    }

    // render list of schedules for user
    return (
      <View style={styles.container}>
        <FlatList
          data={user.schedules}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderItem}
          ListHeaderComponent={() => <Header onPress={this.goToNewSchedule} />}
          onRefresh={this.onRefresh}
          refreshing={networkStatus === 4}
        />
      </View>
    );
  }
}
Schedules.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }),
  loading: PropTypes.bool,
  networkStatus: PropTypes.number,
  refetch: PropTypes.func,
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    schedules: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      }),
    ),
  }),
};

const userQuery = graphql(CURRENT_USER_QUERY, {
  skip: ownProps => !ownProps.auth || !ownProps.auth.token,
  props: ({ data: { loading, networkStatus, refetch, user } }) => ({
    loading, networkStatus, refetch, user,
  }),
});

const mapStateToProps = ({ auth }) => ({
  auth,
});

export default compose(
  connect(mapStateToProps),
  userQuery,
)(Schedules);
