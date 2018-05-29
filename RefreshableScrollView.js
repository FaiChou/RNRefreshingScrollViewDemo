import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import DownImg from './down.png';
const RefreshStatus = {
  pullToRefresh: 0,
  releaseToRefresh: 1,
  refreshing: 2
};

const RefreshActionType = {
  drag: 0,
  scroll: 1,
  release: 2,
};

const REFRESH_VIEW_HEIGHT = 80;

function coroutine(f) {
  let g = f();
  g.next();
  return function(x) {
    g.next(x);
  }
}

export default class RefreshableScrollView extends ScrollView {
  constructor(props) {
    super(props);
    this.state = {
      refreshStatus: RefreshStatus.pullToRefresh,
      refreshTitle: '',
    };
    const that = this;
    this.loop = coroutine(function* () {
      let e = {};
      while (e = yield) {
        if (
          e.type === RefreshActionType.drag
          && that.state.refreshStatus !== RefreshStatus.refreshing
        ) {
          while (e = yield) {
            if (e.type === RefreshActionType.scroll) {
              if (e.offsetY <= -REFRESH_VIEW_HEIGHT) {
                that.changeRefreshStateTo(RefreshStatus.releaseToRefresh);
              } else {
                that.changeRefreshStateTo(RefreshStatus.pullToRefresh);
              }
            } else if (e.type === RefreshActionType.release) {
              if (e.offsetY <= -REFRESH_VIEW_HEIGHT) {
                that.changeRefreshStateTo(RefreshStatus.refreshing);
                that.scrollToRefreshing();
                that.props.onRefresh(() => {
                  // in case the refreshing state not change
                  setTimeout(that.onRefreshEnd, 500);
                });
              } else {
                that.scrollToNormal();
              }
              break;
            }
          }
        }
      }
    });
  }

  onScroll = (event) => {
    const { y } = event.nativeEvent.contentOffset;
    this.loop({ type: RefreshActionType.scroll, offsetY: y });
    if (this.props.onScroll) {
      this.props.onScroll(event);
    }
  }

  onScrollBeginDrag = (event) => {
    this.loop({ type: RefreshActionType.drag });
    if (this.props.onScrollBeginDrag) {
      this.props.onScrollBeginDrag(event);
    }
  }

  onScrollEndDrag = (event) => {
    const { y } = event.nativeEvent.contentOffset;
    this.loop({ type: RefreshActionType.release, offsetY: y });
    if (this.props.onScrollEndDrag) {
      this.props.onScrollEndDrag(event);
    }
  }

  scrollTo = (option) => {
    this._scrollview.scrollTo({ ...option, animated: true });
  }

  scrollToRefreshing = () => {
    this.scrollTo({ x: 0, y: -REFRESH_VIEW_HEIGHT });
  }

  scrollToNormal = () => {
    this.scrollTo({ x: 0, y: 0 });
  }

  onRefreshEnd = () => {
    this.changeRefreshStateTo(RefreshStatus.pullToRefresh);
    this.scrollToNormal();
  }

  changeRefreshStateTo = (state) => {
    let title = '';
    switch (state) {
      case RefreshStatus.pullToRefresh:
        title = 'Pull to refresh';
        break;
      case RefreshStatus.releaseToRefresh:
        title = 'Release to load';
        break;
      case RefreshStatus.refreshing:
        title = 'Loading ..';
        break;
    }
    this.setState({
      refreshStatus: state,
      refreshTitle: title,
    });
  }

  renderRefreshHeader() {
    return (
      <View style={defaultHeaderStyles.header}>
        <View style={defaultHeaderStyles.status}>
          {this.renderSpinner()}
          <Text style={defaultHeaderStyles.statusTitle}>{this.state.refreshTitle}</Text>
        </View>
      </View>
    );
  }

  renderSpinner() {
    const isRefreshing = this.state.refreshStatus === RefreshStatus.refreshing;
    const isNotReached = this.state.refreshStatus === RefreshStatus.pullToRefresh;
    if (isRefreshing) {
      return (
        <ActivityIndicator style={{ marginRight: 10 }} />
      );
    }
    return (
      <Image
        source={DownImg}
        resizeMode="contain"
        style={[
          defaultHeaderStyles.arrow,
          {
            transform: [{
              rotateX: isNotReached ? '0deg' : '-180deg'
            }]
          }]}
      />
    );
  }

  render() {
    return (
      <ScrollView
        ref={c => this._scrollview = c}
        {...this.props}
        scrollEventThrottle={16}
        onScroll={this.onScroll}
        onScrollEndDrag={this.onScrollEndDrag}
        onScrollBeginDrag={this.onScrollBeginDrag}
      >
        {this.renderRefreshHeader()}
        {this.props.children}
      </ScrollView>
    )
  }
}

const defaultHeaderStyles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: -80,
    left: 0,
    right: 0,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center'
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  arrow: {
    width: 23,
    height: 23,
    marginRight: 10,
    opacity: 0.7
  },
  statusTitle: {
    fontSize: 13,
    color: '#333333'
  },
  date: {
    fontSize: 11,
    color: '#333333',
    marginTop: 5
  },
});
