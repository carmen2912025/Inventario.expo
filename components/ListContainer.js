import React from 'react';
import { FlatList, View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function ListContainer({
  data,
  renderItem,
  keyExtractor,
  loading,
  error,
  emptyText = 'Sin datos',
  style,
  ...props
}) {
  if (loading) {
    return <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 32 }} />;
  }
  if (error) {
    return <Text style={{ color: 'red', marginTop: 32 }}>{error}</Text>;
  }
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListEmptyComponent={<Text style={styles.empty}>{emptyText}</Text>}
      style={style}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    color: '#888',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
});
